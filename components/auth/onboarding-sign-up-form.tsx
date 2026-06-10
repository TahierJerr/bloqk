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

const onboardingSignUpSchema = z
    .object({
        name: z.string().min(2, "Vul je naam in"),
        email: z.email("Vul een geldig e-mailadres in"),
        phone: z
            .string()
            .trim()
            .regex(/^\+?[0-9][0-9 ()-]{7,18}$/, "Vul een geldig telefoonnummer in")
            .or(z.literal(""))
            .optional(),
        password: z.string().min(8, "Minimaal 8 tekens"),
        confirmPassword: z.string(),
        otp: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "De wachtwoorden komen niet overeen",
                path: ["confirmPassword"],
            });
        }
    });

type OnboardingSignUpValues = z.infer<typeof onboardingSignUpSchema>;

interface OnboardingSignUpFormProps {
    email?: string;
    onSuccess?: () => void;
    title?: string;
    description?: string;
}

export function OnboardingSignUpForm({
    email,
    onSuccess,
    title,
    description,
    className,
    ...props
}: OnboardingSignUpFormProps & React.ComponentProps<"div">) {
    const router = useRouter();
    // 2-stapsflow: gegevens invullen, daarna e-mail verifiëren met OTP
    const [step, setStep] = useState<"details" | "otp">("details");

    const form = useForm<OnboardingSignUpValues>({
        resolver: zodResolver(onboardingSignUpSchema),
        defaultValues: {
            name: "",
            email: email ?? "",
            phone: "",
            password: "",
            confirmPassword: "",
            otp: "",
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = form;

    // Stap 1: gegevens gevalideerd, verificatiecode aanvragen
    async function onSendOtp(values: OnboardingSignUpValues) {
        const { error } = await authClient.emailOtp.sendVerificationOtp({
            email: values.email.toLowerCase(),
            type: "sign-in",
        });

        if (error) {
            setError("root", {
                message: error.message || "De verificatiecode kon niet worden verstuurd",
            });
            return;
        }

        setStep("otp");
    }

    // Stap 2: OTP verifiëren, daarna het wachtwoord vastleggen zodat de
    // klant na de onboarding ook met e-mail + wachtwoord kan inloggen
    async function onVerifyOtp(values: OnboardingSignUpValues) {
        // De e-mail toont de code als "123 456"; spaties en andere
        // niet-cijfers strippen zodat de code altijd matcht
        const otp = (values.otp ?? "").replace(/\D/g, "");
        if (otp.length !== 6) {
            setError("otp", { message: "Vul de 6-cijferige code uit je e-mail in" });
            return;
        }

        const { error } = await authClient.signIn.emailOtp({
            email: values.email.toLowerCase(),
            otp,
            name: values.name,
            // Extra gebruikersveld; alleen gebruikt bij eerste registratie
            phone: values.phone?.trim() || undefined,
        });

        if (error) {
            setError("root", {
                message: "Ongeldige of verlopen code. Probeer het opnieuw.",
            });
            return;
        }

        // Wachtwoord koppelen aan het zojuist aangemaakte account. Mislukt
        // dit, dan kan de klant nog steeds inloggen via e-mailcode, dus we
        // blokkeren de onboarding er niet op.
        try {
            await fetch("/api/account/set-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: values.password }),
            });
        } catch (error) {
            console.error("Wachtwoord instellen mislukt:", error);
        }

        if (onSuccess) {
            onSuccess();
        } else {
            router.push("/dashboard");
        }
    }

    const onSubmit = step === "details" ? onSendOtp : onVerifyOtp;

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="border-0 shadow-none bg-transparent sm:border sm:shadow-sm sm:bg-card">
                <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">
                        {step === "details"
                            ? (title || "Maak je account aan")
                            : "Check je e-mail"}
                    </CardTitle>
                    <CardDescription>
                        {step === "details"
                            ? (description || "Vul je gegevens in om te beginnen")
                            : `We hebben een beveiligingscode gestuurd naar ${form.getValues("email")}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-4"
                    >
                        <FieldGroup>
                            {step === "details" && (
                                <>
                                    <Field data-invalid={!!errors.name}>
                                        <FieldLabel htmlFor="name">Naam</FieldLabel>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="Voor- en achternaam"
                                            aria-invalid={!!errors.name}
                                            {...register("name")}
                                        />
                                        <FieldError errors={[errors.name]} />
                                    </Field>

                                    <Field data-invalid={!!errors.email}>
                                        <FieldLabel htmlFor="email">E-mailadres</FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="jij@salon.nl"
                                            aria-invalid={!!errors.email}
                                            disabled={!!email}
                                            {...register("email")}
                                        />
                                        <FieldError errors={[errors.email]} />
                                    </Field>

                                    <Field data-invalid={!!errors.phone}>
                                        <FieldLabel htmlFor="phone">Telefoonnummer</FieldLabel>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            autoComplete="tel"
                                            placeholder="06 12345678"
                                            aria-invalid={!!errors.phone}
                                            {...register("phone")}
                                        />
                                        <FieldError errors={[errors.phone]} />
                                    </Field>

                                    <Field data-invalid={!!errors.password}>
                                        <FieldLabel htmlFor="password">Wachtwoord</FieldLabel>
                                        <Input
                                            id="password"
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="Minimaal 8 tekens"
                                            aria-invalid={!!errors.password}
                                            {...register("password")}
                                        />
                                        <FieldError errors={[errors.password]} />
                                    </Field>

                                    <Field data-invalid={!!errors.confirmPassword}>
                                        <FieldLabel htmlFor="confirmPassword">
                                            Herhaal wachtwoord
                                        </FieldLabel>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="Nog een keer, voor de zekerheid"
                                            aria-invalid={!!errors.confirmPassword}
                                            {...register("confirmPassword")}
                                        />
                                        <FieldError errors={[errors.confirmPassword]} />
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
                            <p className="text-sm text-destructive font-medium">
                                {errors.root.message}
                            </p>
                        )}

                        <div className="flex flex-col gap-2 mt-2">
                            <Button
                                className="cursor-pointer"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Verwerken..."
                                    : step === "details"
                                        ? "Verificatiecode sturen"
                                        : "Verifiëren en doorgaan"}
                            </Button>

                            {step === "otp" && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setStep("details")}
                                    disabled={isSubmitting}
                                >
                                    Gegevens wijzigen
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
