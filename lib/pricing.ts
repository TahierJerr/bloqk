// Client-veilige pricing-helpers (geen Prisma-import). De werkelijke
// bedragen komen uit PricingConfig in de database (/admin/pricing).

export type Pricing = {
    websiteBase: number;
    websiteSplitTotal: number;
    websiteUpfront: number;
    subMonthly: number;
    subYearly: number;
    hostingShare: number;
    softwareShare: number;
};

export function formatEuro(cents: number) {
    const euros = cents / 100;
    const formatted = Number.isInteger(euros)
        ? euros.toString()
        : euros.toFixed(2).replace(".", ",");
    return `€${formatted}`;
}

export type PaymentPlan = {
    // Te betalen bij de eerste betaling, in centen
    dueNow: number;
    lines: { label: string; amount: number }[];
    afterNote: string;
};

// Maandbedrag voor de website bij gespreid betalen (jaar 1)
export function splitWebsiteMonthly(pricing: Pricing) {
    return Math.round(pricing.websiteSplitTotal / 12);
}

/**
 * Bepaalt wat er nu afgerekend moet worden op basis van pakket en
 * abonnementskeuze. Maatwerk heeft geen vaste prijs -> null (offerte).
 */
export function computePaymentPlan(
    order: { package: string; billing: string | null },
    pricing: Pricing
): PaymentPlan | null {
    if (order.package !== "Wij bouwen het") return null;

    const breakdown = `waarvan ${formatEuro(pricing.hostingShare)}/mnd hosting en ${formatEuro(pricing.softwareShare)}/mnd software`;

    if (order.billing === "yearly") {
        return {
            dueNow: pricing.websiteUpfront + pricing.subYearly,
            lines: [
                { label: "Website (in één keer)", amount: pricing.websiteUpfront },
                { label: "Abonnement, 12 maanden (2 maanden gratis)", amount: pricing.subYearly },
            ],
            afterNote: `Na het eerste jaar betaal je alleen nog ${formatEuro(pricing.subYearly)} per jaar (${breakdown}).`,
        };
    }

    // Maandelijks: website gespreid over 12 maanden + maandabonnement
    const websiteMonthly = splitWebsiteMonthly(pricing);
    return {
        dueNow: websiteMonthly + pricing.subMonthly,
        lines: [
            {
                label: `Website, termijn 1 van 12 (${formatEuro(pricing.websiteSplitTotal)} totaal)`,
                amount: websiteMonthly,
            },
            { label: "Abonnement, maand 1", amount: pricing.subMonthly },
        ],
        afterNote: `Je betaalt 12 maanden ${formatEuro(websiteMonthly + pricing.subMonthly)} per maand. Daarna is de website afbetaald en betaal je alleen nog ${formatEuro(pricing.subMonthly)} per maand (${breakdown}).`,
    };
}
