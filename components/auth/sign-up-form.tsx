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

// Update schema: remove password, add optional OTP
const signUpSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Enter a valid email address"),
    phone: z
        .string()
        .trim()
        .regex(/^\+?[0-9][0-9 ()-]{7,18}$/, "Vul een geldig telefoonnummer in")
        .or(z.literal(""))
        .optional(),
    otp: z.string().optional(),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
    email?: string;
    onSuccess?: () => void;
    title?: string;
    description?: string;
}

export function SignUpForm({
    email,
    onSuccess, // <-- Extracted to prevent the console error
    title,
    description,
    className,
    ...props
}: SignUpFormProps & React.ComponentProps<"div">) {
    const router = useRouter();
    // New state to manage the 2-step flow
    const [step, setStep] = useState<"details" | "otp">("details");

    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: { name: "", email: email ?? "", phone: "", otp: "" },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = form;

    // Handles Step 1: Requesting the Code
    async function onSendOtp(values: SignUpFormValues) {
        const { error } = await authClient.emailOtp.sendVerificationOtp({
            email: values.email.toLowerCase(),
            type: "sign-in",
            
        });

        if (error) {
            setError("root", {
                message: error.message || "Failed to send verification code",
            });
            return;
        }

        // Move to the next step
        setStep("otp");
    }

    // Handles Step 2: Verifying the Code
    async function onVerifyOtp(values: SignUpFormValues) {
        // The email renders the code as "123 456"; strip spaces/non-digits so
        // typed or copied codes match the 6-digit code stored on the server
        const otp = (values.otp ?? "").replace(/\D/g, "");
        if (otp.length !== 6) {
            setError("otp", { message: "Enter the 6-digit code sent to your email" });
            return;
        }

        const { error } = await authClient.signIn.emailOtp({
            email: values.email.toLowerCase(),
            otp,
            name: values.name,
            // Extra user field; alleen gebruikt bij eerste registratie
            phone: values.phone?.trim() || undefined,
        });

        if (error) {
            setError("root", {
                message: "Invalid or expired code. Please try again.",
            });
            return;
        }

        // Control flow: Either run the callback to continue onboarding or redirect
        if (onSuccess) {
            onSuccess();
        } else {
            router.push("/dashboard");
        }
    }

    // Dynamic submit handler based on current step
    const onSubmit = step === "details" ? onSendOtp : onVerifyOtp;

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="border-0 shadow-none bg-transparent sm:border sm:shadow-sm sm:bg-card">
                <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">
                        {step === "details"
                            ? (title || "Create an account")
                            : "Check je e-mail"}
                    </CardTitle>
                    <CardDescription>
                        {step === "details"
                            ? (description || "Enter your details below to create your account")
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
                                    {/* Name Field */}
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

                                    {/* Email Field */}
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

                                    {/* Phone Field */}
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
                                </>
                            )}

                            {step === "otp" && (
                                <>
                                    {/* OTP Field */}
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
                                </>
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

                            {/* Allow user to go back if they made a typo in their email */}
                            {step === "otp" && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setStep("details")}
                                    disabled={isSubmitting}
                                >
                                    E-mailadres wijzigen
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}