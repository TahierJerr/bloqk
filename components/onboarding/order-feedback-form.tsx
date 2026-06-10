"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Field,
    FieldError,
    FieldGroup,
} from "@/components/ui/field";
import {
    FEEDBACK_REASONS,
    FEEDBACK_REASON_LABELS,
    orderFeedbackSchema,
    type OrderFeedbackValues,
} from "@/lib/order-schema";

const reasonDescriptions: Record<(typeof FEEDBACK_REASONS)[number], string> = {
    changes: "We passen de pagina aan en sturen je een nieuwe preview.",
    "not-what-i-want": "Vertel ons wat je mist, dan kijken we wat er mogelijk is.",
    cancel: "We stoppen je aanvraag. Je betaalt uiteraard niets.",
};

export function OrderFeedbackForm({ onSuccess }: { onSuccess: () => void }) {
    const {
        register,
        control,
        handleSubmit,
        watch,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<OrderFeedbackValues>({
        resolver: zodResolver(orderFeedbackSchema),
        defaultValues: { message: "" },
    });

    // eslint-disable-next-line react-hooks/incompatible-library
    const reason = watch("reason");

    async function onSubmit(values: OrderFeedbackValues) {
        const res = await fetch("/api/order/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
        });

        if (!res.ok) {
            setError("root", {
                message: "Er ging iets mis bij het versturen. Probeer het opnieuw.",
            });
            return;
        }

        onSuccess();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <FieldGroup>
                <Field data-invalid={!!errors.reason}>
                    <span className="text-sm leading-snug font-medium select-none">
                        Wat is er aan de hand?
                    </span>
                    <Controller
                        control={control}
                        name="reason"
                        render={({ field }) => (
                            <RadioGroup
                                value={field.value ?? ""}
                                onValueChange={field.onChange}
                                className="gap-2.5"
                            >
                                {FEEDBACK_REASONS.map((value) => (
                                    <label
                                        key={value}
                                        htmlFor={`reason-${value}`}
                                        className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm transition-colors select-none hover:bg-secondary/50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
                                    >
                                        <RadioGroupItem
                                            value={value}
                                            id={`reason-${value}`}
                                            className="mt-0.5"
                                        />
                                        <span className="flex flex-col gap-0.5">
                                            <span className="font-medium">
                                                {FEEDBACK_REASON_LABELS[value]}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {reasonDescriptions[value]}
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </RadioGroup>
                        )}
                    />
                    <FieldError errors={[errors.reason]} />
                </Field>

                <Field data-invalid={!!errors.message}>
                    <label
                        htmlFor="feedback-message"
                        className="text-sm leading-snug font-medium select-none"
                    >
                        {reason === "changes" ? "Welke aanpassingen wil je?" : "Toelichting (optioneel)"}
                    </label>
                    <Textarea
                        id="feedback-message"
                        rows={4}
                        placeholder={
                            reason === "cancel"
                                ? "Vertel gerust waarom, dan leren wij ervan."
                                : "Beschrijf zo concreet mogelijk wat je anders wilt zien."
                        }
                        aria-invalid={!!errors.message}
                        {...register("message")}
                    />
                    <FieldError errors={[errors.message]} />
                </Field>
            </FieldGroup>

            {errors.root && (
                <p className="text-sm text-destructive font-medium">
                    {errors.root.message}
                </p>
            )}

            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Versturen...
                    </>
                ) : (
                    "Feedback versturen"
                )}
            </Button>
        </form>
    );
}
