"use client";

import { cn } from "@/lib/utils";
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

const adminSignUpSchema = z
    .object({
        name: z.string().min(2, "Vul je naam in"),
        email: z.email("Vul een geldig e-mailadres in"),
        password: z.string().min(8, "Minimaal 8 tekens"),
        confirmPassword: z.string(),
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

type AdminSignUpValues = z.infer<typeof adminSignUpSchema>;

// Eenmalig registratieformulier voor de eerste superadmin; daarna geeft
// de bootstrap-route een 403 en toont /sign-up een 404
export function AdminSignUpForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<AdminSignUpValues>({
        resolver: zodResolver(adminSignUpSchema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    });

    async function onSubmit(values: AdminSignUpValues) {
        const res = await fetch("/api/admin/bootstrap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: values.name,
                email: values.email.toLowerCase(),
                password: values.password,
            }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => null);
            setError("root", {
                message:
                    typeof data?.error === "string"
                        ? data.error
                        : "Het account kon niet worden aangemaakt",
            });
            return;
        }

        const { error } = await authClient.signIn.email({
            email: values.email.toLowerCase(),
            password: values.password,
        });

        if (error) {
            // Account bestaat wel; doorsturen naar de inlogpagina
            router.push("/sign-in");
            return;
        }

        router.push("/admin");
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="border-0 shadow-none bg-transparent sm:border sm:shadow-sm sm:bg-card">
                <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">
                        Superadmin-account aanmaken
                    </CardTitle>
                    <CardDescription>
                        Eenmalige registratie voor het beheer van Bloqk.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-4"
                    >
                        <FieldGroup>
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
                                    placeholder="jij@bloqk.nl"
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
                        </FieldGroup>

                        {errors.root && (
                            <p className="text-sm text-destructive font-medium">
                                {errors.root.message}
                            </p>
                        )}

                        <Button
                            className="mt-2 cursor-pointer"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Verwerken..." : "Account aanmaken"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
