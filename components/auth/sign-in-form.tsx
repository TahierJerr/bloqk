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

const signInSchema = z.object({
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SignInForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter();

    const form = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: "", password: "" },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = form;

    // Standard Email/Password Sign-In
    async function onSubmit(values: SignInFormValues) {
        await authClient.signIn.email(
            {
                email: values.email,
                password: values.password,
                callbackURL: "/dashboard",
            },
            {
                onSuccess: () => {
                    router.push("/dashboard");
                },
                onError: (ctx) => {
                    setError("root", { message: ctx.error.message });
                },
            }
        );
    }

    // Passkey Sign-In
    async function handlePasskeySignIn() {
        await authClient.signIn.passkey(
            {},
            {
                onSuccess: () => {
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
                    <CardTitle>Sign in to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <FieldGroup>
                            <Field data-invalid={!!errors.email}>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    aria-invalid={!!errors.email}
                                    {...register("email")}
                                />
                                <FieldError errors={[errors.email]} />
                            </Field>
                            <Field data-invalid={!!errors.password}>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    aria-invalid={!!errors.password}
                                    {...register("password")}
                                />
                                <FieldError errors={[errors.password]} />
                            </Field>
                        </FieldGroup>
                        
                        {errors.root && (
                            <p className="text-sm text-destructive">
                                {errors.root.message}
                            </p>
                        )}
                        
                        <div className="flex flex-col gap-2">
                            <Button className="cursor-pointer" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Signing in..." : "Sign in"}
                            </Button>
                        </div>

                        {/* --- Passkey Divider & Button --- */}
                        <div className="relative my-4 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                            <span className="relative z-10 bg-background px-2 text-muted-foreground">
                                Or
                            </span>
                        </div>

                        <Button
                            variant="outline"
                            type="button"
                            onClick={handlePasskeySignIn}
                            className="w-full cursor-pointer"
                        >
                            Sign in with Passkey
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}