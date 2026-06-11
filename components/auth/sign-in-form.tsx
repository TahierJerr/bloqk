"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const signInSchema = z.object({
    email: z.email("Vul een geldig e-mailadres in"),
    password: z.string().min(8, "Minimaal 8 tekens"),
    otp: z.string().optional(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

// Eén OTP-controle per 24 uur per apparaat
const OTP_STORAGE_KEY = "bloqk_otp_verified_at";
const OTP_VALID_MS = 24 * 60 * 60 * 1000;

function otpRecentlyVerified() {
    try {
        const at = window.localStorage.getItem(OTP_STORAGE_KEY);
        return !!at && Date.now() - Number(at) < OTP_VALID_MS;
    } catch {
        return false;
    }
}

function markOtpVerified() {
    try {
        window.localStorage.setItem(OTP_STORAGE_KEY, String(Date.now()));
    } catch {
        // localStorage niet beschikbaar: dan vragen we de volgende keer gewoon weer
    }
}

export function SignInForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter();
    const [step, setStep] = useState<"credentials" | "otp">("credentials");

    const form = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: "", password: "", otp: "" },
    });

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
        setError,
    } = form;

    // Stap 1: e-mail + wachtwoord; daarna max. 1x per 24 uur een OTP-check
    async function onSignIn(values: SignInFormValues) {
        const { error } = await authClient.signIn.email({
            email: values.email.toLowerCase(),
            password: values.password,
        });

        if (error) {
            setError("root", { message: error.message ?? "Inloggen mislukt" });
            return;
        }

        if (otpRecentlyVerified()) {
            router.push("/dashboard");
            return;
        }

        const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
            email: values.email.toLowerCase(),
            type: "sign-in",
        });
        if (otpError) {
            // OTP kon niet verstuurd worden; inloggen is al gelukt
            router.push("/dashboard");
            return;
        }
        setStep("otp");
    }

    // Stap 2: OTP verifiëren en 24 uur onthouden
    async function onVerifyOtp(values: SignInFormValues) {
        const otp = (values.otp ?? "").replace(/\D/g, "");
        if (otp.length !== 6) {
            setError("otp", { message: "Vul de 6-cijferige code uit je e-mail in" });
            return;
        }

        const { error } = await authClient.signIn.emailOtp({
            email: values.email.toLowerCase(),
            otp,
        });

        if (error) {
            setError("root", {
                message: "Ongeldige of verlopen code. Probeer het opnieuw.",
            });
            return;
        }

        markOtpVerified();
        router.push("/dashboard");
    }

    const onSubmit = step === "credentials" ? onSignIn : onVerifyOtp;

    // Passkey is zelf al een sterke tweede factor; geen OTP nodig
    async function handlePasskeySignIn() {
        await authClient.signIn.passkey(
            {},
            {
                onSuccess: () => {
                    markOtpVerified();
                    router.push("/dashboard");
                },
                onError: (ctx) => {
                    setError("root", { message: ctx.error.message });
                },
            }
        );
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {step === "credentials" ? "Inloggen" : "Check je e-mail"}
                    </CardTitle>
                    <CardDescription>
                        {step === "credentials"
                            ? "Log in met je e-mailadres en wachtwoord"
                            : `We hebben een beveiligingscode gestuurd naar ${getValues("email")}. Dit vragen we maximaal één keer per 24 uur.`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <FieldGroup>
                            {step === "credentials" && (
                                <>
                                    <Field data-invalid={!!errors.email}>
                                        <FieldLabel htmlFor="email">E-mailadres</FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="jij@salon.nl"
                                            aria-invalid={!!errors.email}
                                            {...register("email")}
                                        />
                                        <FieldError errors={[errors.email]} />
                                    </Field>
                                    <Field data-invalid={!!errors.password}>
                                        <FieldLabel htmlFor="password">Wachtwoord</FieldLabel>
                                        <Input
                                            id="password"
                                            type="password"
                                            autoComplete="current-password"
                                            aria-invalid={!!errors.password}
                                            {...register("password")}
                                        />
                                        <FieldError errors={[errors.password]} />
                                    </Field>
                                </>
                            )}

                            {step === "otp" && (
                                <Field data-invalid={!!errors.otp}>
                                    <FieldLabel htmlFor="otp">Verificatiecode</FieldLabel>
                                    <Input
                                        id="otp"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        placeholder="000 000"
                                        aria-invalid={!!errors.otp}
                                        {...register("otp")}
                                    />
                                    <FieldError errors={[errors.otp]} />
                                </Field>
                            )}
                        </FieldGroup>

                        {errors.root && (
                            <p className="text-sm text-destructive">
                                {errors.root.message}
                            </p>
                        )}

                        <div className="flex flex-col gap-2">
                            <Button className="cursor-pointer" type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? "Bezig..."
                                    : step === "credentials"
                                        ? "Inloggen"
                                        : "Verifiëren"}
                            </Button>
                        </div>

                        {step === "credentials" && (
                            <>
                                {/* --- Passkey Divider & Button --- */}
                                <div className="relative my-4 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                                        Of
                                    </span>
                                </div>

                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={handlePasskeySignIn}
                                    className="w-full cursor-pointer"
                                >
                                    Inloggen met passkey
                                </Button>
                            </>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
