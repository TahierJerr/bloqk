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
    // Te betalen in de eerste (checkout-)betaling, in centen
    dueNow: number;
    lines: { label: string; amount: number }[];
    // Wat daarna automatisch via incasso loopt (Mollie-abonnementen)
    recurring: { label: string; amount: number }[];
    afterNote: string;
};

// Specificatie van de Mollie-abonnementen die na de eerste betaling starten
export type SubscriptionSpec = {
    amount: number; // centen
    interval: "1 month" | "12 months";
    description: string;
    // Startmoment in maanden vanaf nu (0 = direct)
    startAfterMonths: number;
    // Aantal incasso's; weglaten = doorlopend
    times?: number;
};

// Maandbedrag voor de website bij gespreid betalen (jaar 1)
export function splitWebsiteMonthly(pricing: Pricing) {
    return Math.round(pricing.websiteSplitTotal / 12);
}

/**
 * Bepaalt wat er in de eerste checkout afgerekend wordt en wat daarna
 * automatisch volgt. Mollie kan een eenmalige betaling en een abonnement
 * niet in één checkout combineren, dus we splitsen: de klant rekent eerst
 * de eerste betaling af (die ook de incassomachtiging oplevert) en daarna
 * starten de abonnementen automatisch op die machtiging.
 * Maatwerk heeft geen vaste prijs -> null (offerte).
 */
export function computePaymentPlan(
    order: { package: string; billing: string | null },
    pricing: Pricing
): PaymentPlan | null {
    if (order.package !== "Wij bouwen het") return null;

    const breakdown = `waarvan ${formatEuro(pricing.hostingShare)}/mnd hosting en ${formatEuro(pricing.softwareShare)}/mnd software`;

    if (order.billing === "yearly") {
        return {
            dueNow: pricing.websiteUpfront,
            lines: [
                { label: "Website (in één keer)", amount: pricing.websiteUpfront },
            ],
            recurring: [
                {
                    label: "Abonnement per jaar (start direct, 2 maanden gratis)",
                    amount: pricing.subYearly,
                },
            ],
            afterNote: `Na je betaling start het jaarabonnement van ${formatEuro(pricing.subYearly)} automatisch via incasso. Ook na het eerste jaar blijft het ${formatEuro(pricing.subYearly)} per jaar (${breakdown}).`,
        };
    }

    // Maandelijks: website gespreid over 12 maanden + maandabonnement
    const websiteMonthly = splitWebsiteMonthly(pricing);
    const monthYear1 = websiteMonthly + pricing.subMonthly;
    return {
        dueNow: monthYear1,
        lines: [
            {
                label: `Website, termijn 1 van 12 (${formatEuro(pricing.websiteSplitTotal)} totaal)`,
                amount: websiteMonthly,
            },
            { label: "Abonnement, maand 1", amount: pricing.subMonthly },
        ],
        recurring: [
            { label: "Maand 2 t/m 12 (automatische incasso)", amount: monthYear1 },
            { label: "Vanaf jaar 2, per maand", amount: pricing.subMonthly },
        ],
        afterNote: `Maand 2 t/m 12 wordt ${formatEuro(monthYear1)} per maand automatisch geïncasseerd. Daarna is de website afbetaald en betaal je alleen nog ${formatEuro(pricing.subMonthly)} per maand (${breakdown}).`,
    };
}

/**
 * De Mollie-abonnementen die na de eerste betaalde betaling aangemaakt
 * worden op de mandate van die betaling.
 */
export function computeSubscriptions(
    order: { package: string; billing: string | null },
    pricing: Pricing
): SubscriptionSpec[] {
    if (order.package !== "Wij bouwen het") return [];

    if (order.billing === "yearly") {
        return [
            {
                amount: pricing.subYearly,
                interval: "12 months",
                description: "Bloqk abonnement (jaarlijks)",
                startAfterMonths: 0,
            },
        ];
    }

    const monthYear1 = splitWebsiteMonthly(pricing) + pricing.subMonthly;
    return [
        {
            amount: monthYear1,
            interval: "1 month",
            description: "Bloqk website (termijnen) + abonnement, jaar 1",
            startAfterMonths: 1,
            times: 11,
        },
        {
            amount: pricing.subMonthly,
            interval: "1 month",
            description: "Bloqk abonnement (maandelijks)",
            startAfterMonths: 12,
        },
    ];
}
