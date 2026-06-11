"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { DAY_NAMES } from "@/lib/intake-schema";

const settingsFormSchema = z.object({
    phone: z
        .string()
        .trim()
        .regex(/^\+?[0-9][0-9 ()-]{7,18}$/, "Vul een geldig telefoonnummer in")
        .or(z.literal("")),
    email: z.email("Vul een geldig e-mailadres in").or(z.literal("")),
    openingHours: z
        .array(
            z.object({
                closed: z.boolean(),
                open: z.string().regex(/^\d{2}:\d{2}$/, "Vul een tijd in"),
                close: z.string().regex(/^\d{2}:\d{2}$/, "Vul een tijd in"),
            })
        )
        .length(7),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export type SalonSettingsData = {
    phone: string;
    email: string;
    openingHours: { closed: boolean; open: string; close: string }[];
    canEdit: boolean;
};

export function SettingsForm({ settings }: { settings: SalonSettingsData }) {
    const router = useRouter();
    const [saved, setSaved] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            phone: settings.phone,
            email: settings.email,
            openingHours: settings.openingHours,
        },
    });

    // eslint-disable-next-line react-hooks/incompatible-library
    const values = watch();

    async function onSubmit(formValues: SettingsFormValues) {
        setSaved(false);
        const res = await fetch("/api/salon/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone: formValues.phone,
                email: formValues.email,
                openingHours: formValues.openingHours.map((hour, index) => ({
                    day: index,
                    closed: hour.closed,
                    open: hour.open,
                    close: hour.close,
                })),
            }),
        });

        if (!res.ok) {
            setError("root", { message: "Opslaan mislukt. Probeer het opnieuw." });
            return;
        }

        setSaved(true);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <fieldset
                disabled={!settings.canEdit}
                className="flex flex-col gap-6 disabled:opacity-70"
            >
                <section className="rounded-2xl border bg-card p-5">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Contactgegevens
                    </h2>
                    <FieldGroup className="mt-4">
                        <Field data-invalid={!!errors.phone}>
                            <FieldLabel htmlFor="phone">Telefoonnummer</FieldLabel>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="06 12345678"
                                aria-invalid={!!errors.phone}
                                {...register("phone")}
                            />
                            <FieldError errors={[errors.phone]} />
                        </Field>
                        <Field data-invalid={!!errors.email}>
                            <FieldLabel htmlFor="email">E-mailadres salon</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                placeholder="info@jouwsalon.nl"
                                aria-invalid={!!errors.email}
                                {...register("email")}
                            />
                            <FieldError errors={[errors.email]} />
                        </Field>
                    </FieldGroup>
                </section>

                <section className="rounded-2xl border bg-card p-5">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Openingstijden
                    </h2>
                    <div className="mt-4 flex flex-col divide-y overflow-hidden rounded-xl border">
                        {DAY_NAMES.map((day, index) => {
                            const closed = values.openingHours[index]?.closed;
                            return (
                                <div
                                    key={day}
                                    className="flex flex-wrap items-center gap-3 px-4 py-3"
                                >
                                    <Controller
                                        control={control}
                                        name={`openingHours.${index}.closed`}
                                        render={({ field }) => (
                                            <label className="flex w-32 cursor-pointer items-center gap-2.5 select-none">
                                                <Checkbox
                                                    checked={!field.value}
                                                    onCheckedChange={(checked) =>
                                                        field.onChange(checked !== true)
                                                    }
                                                />
                                                <span
                                                    className={cn(
                                                        "text-sm font-medium",
                                                        closed && "text-muted-foreground"
                                                    )}
                                                >
                                                    {day}
                                                </span>
                                            </label>
                                        )}
                                    />
                                    {closed ? (
                                        <span className="text-sm text-muted-foreground">
                                            Gesloten
                                        </span>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="time"
                                                className="w-28"
                                                aria-label={`${day} openingstijd`}
                                                {...register(`openingHours.${index}.open`)}
                                            />
                                            <span className="text-sm text-muted-foreground">tot</span>
                                            <Input
                                                type="time"
                                                className="w-28"
                                                aria-label={`${day} sluitingstijd`}
                                                {...register(`openingHours.${index}.close`)}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {errors.root && (
                    <p className="text-sm font-medium text-destructive">
                        {errors.root.message}
                    </p>
                )}
                {saved && (
                    <p className="text-sm font-medium text-emerald-600">
                        Instellingen opgeslagen.
                    </p>
                )}

                <Button type="submit" disabled={isSubmitting} className="cursor-pointer self-start">
                    {isSubmitting ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 size-4" />
                    )}
                    Opslaan
                </Button>
            </fieldset>

            {!settings.canEdit && (
                <p className="text-sm text-muted-foreground">
                    Alleen de eigenaar of beheerder kan instellingen wijzigen.
                </p>
            )}
        </form>
    );
}
