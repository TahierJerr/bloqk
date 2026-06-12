import { z } from "zod";

export const SALON_TYPES = [
    "Kapsalons / barbershops",
    "Nagelstudio's",
    "Schoonheidssalons",
    "Tattooshops",
    "Piercingstudio's",
    "Massagesalons",
] as const;

export const PACKAGES = [
    "Wij bouwen het",
] as const;

export type SalonType = (typeof SALON_TYPES)[number];
export type Package = (typeof PACKAGES)[number];

// Bedragen voor de Mollie-betaling per pakket (in EUR, als string zoals
// Mollie ze verwacht). "Eerst praten" heeft geen vaste prijs; daar sturen
// we een betaallink na het gesprek.
export const PACKAGE_PRICES: Record<Package, string | null> = {
    "Wij bouwen het": "149.00",
};

export const SUBSCRIPTION_PRICES = {
    monthly: "29.00",
    yearly: "313.00", // 2 months free vs 29 * 12 = 348
};

// Abonnement is verplicht (dashboard + boekingen); keuze is maand of jaar
export const BILLING_OPTIONS = ["monthly", "yearly"] as const;
export type Billing = (typeof BILLING_OPTIONS)[number];

export const BILLING_LABELS: Record<Billing, string> = {
    monthly: "Maandelijks (alles gespreid)",
    yearly: "Jaarlijks (beste deal)",
};

export const FEEDBACK_REASONS = [
    "changes",
    "not-what-i-want",
    "cancel",
] as const;

export type FeedbackReason = (typeof FEEDBACK_REASONS)[number];

export const FEEDBACK_REASON_LABELS: Record<FeedbackReason, string> = {
    changes: "Ik wil graag aanpassingen",
    "not-what-i-want": "Dit is niet wat ik zoek",
    cancel: "Ik wil mijn aanvraag annuleren",
};

export const orderFeedbackSchema = z
    .object({
        reason: z.enum(FEEDBACK_REASONS, { message: "Maak een keuze" }),
        message: z.string().trim().max(2000, "Houd je bericht wat korter").optional(),
    })
    .superRefine((data, ctx) => {
        // Bij aanpassingen moeten we weten wát er anders moet
        if (data.reason === "changes" && (!data.message || data.message.length < 5)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Beschrijf kort welke aanpassingen je wilt",
                path: ["message"],
            });
        }
    });

export type OrderFeedbackValues = z.infer<typeof orderFeedbackSchema>;

export const orderSchema = z.object({
    salonName: z.string().min(1, "Vul de naam van je salon in"),
    salonType: z.enum(SALON_TYPES, { message: "Maak een keuze" }),
    hasDomain: z.enum(["yes", "no"], { message: "Maak een keuze" }),
    customDomain: z.string().optional(),
    // Gekozen suggestie voor een nieuw te registreren domein (optioneel)
    newDomain: z
        .string()
        .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?\.[a-z]{2,}$/, "Ongeldige domeinnaam")
        .or(z.literal(""))
        .optional(),
    address: z.string().min(1, "Kies een adres uit de lijst"),
    package: z.enum(PACKAGES, { message: "Maak een keuze" }),
    billing: z.enum(BILLING_OPTIONS, { message: "Maak een keuze" }),
}).superRefine((data, ctx) => {
    // Als ze 'ja' kiezen, moet het domeinveld ingevuld zijn
    if (data.hasDomain === "yes" && (!data.customDomain || data.customDomain.trim().length < 3)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Vul je bestaande domeinnaam in",
            path: ["customDomain"],
        });
    }
});

export type OrderFormValues = z.infer<typeof orderSchema>;