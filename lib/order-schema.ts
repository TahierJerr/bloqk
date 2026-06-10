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
    "Maandelijks abonnement",
    "Eenmalig + hosting",
    "Ik wil eerst even praten",
] as const;

export type SalonType = (typeof SALON_TYPES)[number];
export type Package = (typeof PACKAGES)[number];

export const orderSchema = z.object({
    salonName: z.string().min(1, "Vul de naam van je salon in"),
    salonType: z.enum(SALON_TYPES, { message: "Maak een keuze" }),
    hasDomain: z.enum(["yes", "no"], { message: "Maak een keuze" }),
    customDomain: z.string().optional(),
    address: z.string().min(1, "Kies een adres uit de lijst"),
    package: z.enum(PACKAGES, { message: "Maak een keuze" }),
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