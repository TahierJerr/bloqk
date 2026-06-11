"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {
    computePaymentPlan,
    formatEuro,
    splitWebsiteMonthly,
    type Pricing,
} from "@/lib/pricing";

// Invoer in euro's (string), opslag in centen
const euroString = z
    .string()
    .trim()
    .regex(/^\d+([.,]\d{1,2})?$/, "Bijv. 149 of 16,58");

const pricingFormSchema = z.object({
    websiteBase: euroString,
    websiteSplitTotal: euroString,
    websiteUpfront: euroString,
    subMonthly: euroString,
    subYearly: euroString,
    hostingShare: euroString,
    softwareShare: euroString,
});

type PricingFormValues = z.infer<typeof pricingFormSchema>;

const FIELDS: {
    name: keyof PricingFormValues;
    label: string;
    hint: string;
}[] = [
    { name: "websiteBase", label: "Website — vanafprijs", hint: "De prijs die je communiceert in het orderformulier." },
    { name: "websiteSplitTotal", label: "Website — gespreid (totaal)", hint: "Totaalbedrag bij betalen in 12 maandtermijnen." },
    { name: "websiteUpfront", label: "Website — in één keer", hint: "Bedrag bij de jaardeal (website vooraf betaald)." },
    { name: "subMonthly", label: "Abonnement — per maand", hint: "Dashboard + online boekingen, per maand." },
    { name: "subYearly", label: "Abonnement — per jaar", hint: "Jaarprijs; reken zelf de korting (bijv. 2 maanden gratis) in." },
    { name: "hostingShare", label: "Waarvan hosting (p/mnd)", hint: "Informatieve uitsplitsing voor de klant." },
    { name: "softwareShare", label: "Waarvan software (p/mnd)", hint: "Informatieve uitsplitsing voor de klant." },
];

function toEuroInput(cents: number) {
    const euros = cents / 100;
    return Number.isInteger(euros) ? euros.toString() : euros.toFixed(2).replace(".", ",");
}

function toCents(value: string) {
    return Math.round(parseFloat(value.replace(",", ".")) * 100);
}

export function PricingForm({ pricing }: { pricing: Pricing }) {
    const router = useRouter();
    const [saved, setSaved] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<PricingFormValues>({
        resolver: zodResolver(pricingFormSchema),
        defaultValues: {
            websiteBase: toEuroInput(pricing.websiteBase),
            websiteSplitTotal: toEuroInput(pricing.websiteSplitTotal),
            websiteUpfront: toEuroInput(pricing.websiteUpfront),
            subMonthly: toEuroInput(pricing.subMonthly),
            subYearly: toEuroInput(pricing.subYearly),
            hostingShare: toEuroInput(pricing.hostingShare),
            softwareShare: toEuroInput(pricing.softwareShare),
        },
    });

    // eslint-disable-next-line react-hooks/incompatible-library
    const values = watch();

    // Live voorbeeld van wat klanten te zien krijgen
    const preview: Pricing | null = (() => {
        try {
            const candidate = Object.fromEntries(
                Object.entries(values).map(([key, value]) => [key, toCents(value as string)])
            ) as unknown as Pricing;
            return Object.values(candidate).some((v) => Number.isNaN(v)) ? null : candidate;
        } catch {
            return null;
        }
    })();
    const monthlyPlan = preview
        ? computePaymentPlan({ package: "Wij bouwen het", billing: "monthly" }, preview)
        : null;
    const yearlyPlan = preview
        ? computePaymentPlan({ package: "Wij bouwen het", billing: "yearly" }, preview)
        : null;

    async function onSubmit(formValues: PricingFormValues) {
        setSaved(false);
        const res = await fetch("/api/admin/pricing", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
                Object.fromEntries(
                    Object.entries(formValues).map(([key, value]) => [key, toCents(value)])
                )
            ),
        });

        if (!res.ok) {
            setError("root", { message: "Opslaan mislukt. Probeer het opnieuw." });
            return;
        }

        setSaved(true);
        router.refresh();
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5 rounded-2xl border bg-card p-5"
            >
                <FieldGroup>
                    {FIELDS.map((field) => (
                        <Field key={field.name} data-invalid={!!errors[field.name]}>
                            <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    €
                                </span>
                                <Input
                                    id={field.name}
                                    inputMode="decimal"
                                    className="pl-7"
                                    aria-invalid={!!errors[field.name]}
                                    {...register(field.name)}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">{field.hint}</p>
                            <FieldError errors={[errors[field.name]]} />
                        </Field>
                    ))}
                </FieldGroup>

                {errors.root && (
                    <p className="text-sm font-medium text-destructive">
                        {errors.root.message}
                    </p>
                )}
                {saved && (
                    <p className="text-sm font-medium text-emerald-600">
                        Prijzen opgeslagen. Nieuwe aanvragen en openstaande betalingen
                        gebruiken direct deze bedragen.
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
            </form>

            {/* Live preview van beide betaalplannen */}
            <aside className="flex h-fit flex-col gap-4">
                <div className="rounded-2xl border bg-card p-5">
                    <h3 className="text-sm font-semibold">Maandelijks (jaar 1)</h3>
                    {monthlyPlan && preview ? (
                        <>
                            <p className="mt-2 text-2xl font-semibold tracking-tight">
                                {formatEuro(monthlyPlan.dueNow)}
                                <span className="text-sm font-normal text-muted-foreground">
                                    {" "}/ maand
                                </span>
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {formatEuro(splitWebsiteMonthly(preview))} website +{" "}
                                {formatEuro(preview.subMonthly)} abonnement. Na 12 maanden
                                nog {formatEuro(preview.subMonthly)}/mnd.
                            </p>
                        </>
                    ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                            Vul geldige bedragen in.
                        </p>
                    )}
                </div>
                <div className="rounded-2xl border bg-card p-5">
                    <h3 className="text-sm font-semibold">Jaardeal</h3>
                    {yearlyPlan && preview ? (
                        <>
                            <p className="mt-2 text-2xl font-semibold tracking-tight">
                                {formatEuro(preview.websiteUpfront + preview.subYearly)}
                                <span className="text-sm font-normal text-muted-foreground">
                                    {" "}eerste jaar
                                </span>
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {formatEuro(preview.websiteUpfront)} website +{" "}
                                {formatEuro(preview.subYearly)} abonnement/jaar. Daarna{" "}
                                {formatEuro(preview.subYearly)}/jaar.
                            </p>
                        </>
                    ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                            Vul geldige bedragen in.
                        </p>
                    )}
                </div>
                <p className="rounded-2xl border bg-primary/5 p-4 text-xs font-medium text-primary">
                    Klanten zien overal: 0% commissie op boekingen.
                </p>
            </aside>
        </div>
    );
}
