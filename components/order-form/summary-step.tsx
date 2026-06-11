"use client";

import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { BILLING_LABELS, type OrderFormValues } from "@/lib/order-schema";

function SummaryValue({ value }: { value: string | null }) {
    return (
        <span
            className={cn(
                "flex-1 text-sm wrap-break-word",
                value ? "font-medium" : "italic text-muted-foreground"
            )}
        >
            {value ?? "Niet opgegeven"}
        </span>
    );
}

/**
 * De laatste stap van het orderformulier: alle antwoorden met
 * 'Wijzig'-knoppen plus de accountgegevens.
 */
export function SummaryStep({
    values,
    onEdit,
    session,
}: {
    values: OrderFormValues;
    onEdit: (step: number) => void;
    session: { user: { name?: string | null; email?: string | null; phone?: string | null | undefined } };
}) {
    const rows: { label: string; value: string | null; step: number }[] = [
        { label: "Type", value: values.salonType ?? null, step: 0 },
        { label: "Salon", value: values.salonName || null, step: 1 },
        {
            label: "Domein",
            value: values.hasDomain === "yes"
                ? values.customDomain || null
                : values.hasDomain === "no"
                    ? values.newDomain
                        ? `${values.newDomain} (nieuw te registreren)`
                        : "Kiezen we later samen"
                    : null,
            step: 2,
        },
        { label: "Adres", value: values.address || null, step: 3 },
        { label: "Pakket", value: values.package ?? null, step: 4 },
        {
            label: "Betaling",
            value: values.billing ? BILLING_LABELS[values.billing] : null,
            step: 5,
        },
    ];

    const accountRows: { label: string; value: string | null }[] = [
        { label: "Naam", value: session.user.name || null },
        { label: "E-mail", value: session.user.email || null },
        { label: "Telefoon", value: session.user.phone || null },
    ];

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="w-full divide-y overflow-hidden rounded-2xl border bg-card">
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className="flex items-start gap-4 px-4 py-3.5"
                    >
                        <span className="w-20 shrink-0 text-sm text-muted-foreground sm:w-24">
                            {row.label}
                        </span>
                        <SummaryValue value={row.value} />
                        <button
                            type="button"
                            onClick={() => onEdit(row.step)}
                            aria-label={`${row.label} wijzigen`}
                            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                        >
                            <Pencil className="size-3" />
                            Wijzig
                        </button>
                    </div>
                ))}
            </div>

            <div className="w-full overflow-hidden rounded-2xl border bg-muted/40">
                <p className="border-b px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Je account
                </p>
                <div className="divide-y">
                    {accountRows.map((row) => (
                        <div
                            key={row.label}
                            className="flex items-start gap-4 px-4 py-3"
                        >
                            <span className="w-20 shrink-0 text-sm text-muted-foreground sm:w-24">
                                {row.label}
                            </span>
                            <SummaryValue value={row.value} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
