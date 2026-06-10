import { z } from "zod";

// ─── Contactverzoek ("overleggen") ───────────────────────────────────────────

export const CONTACT_METHODS = ["email", "phone", "video"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

export const CONTACT_METHOD_LABELS: Record<ContactMethod, string> = {
    email: "Via e-mail",
    phone: "Telefonisch",
    video: "Via videocall",
};

export const contactRequestSchema = z.object({
    choice: z.literal("call"),
    contactMethod: z.enum(CONTACT_METHODS, { message: "Maak een keuze" }),
});

// ─── Wizard ("zelf invullen") ────────────────────────────────────────────────

const hexColor = z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Kies een geldige kleur");

const timeString = z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Gebruik het formaat uu:mm");

// Afbeeldingen komen als data-URL binnen (client-side verkleind);
// tijdelijke oplossing tot er objectopslag (S3 e.d.) is gekoppeld
const imageDataUrl = z
    .string()
    .startsWith("data:image/", "Ongeldige afbeelding")
    .max(2_500_000, "Afbeelding is te groot");

export const openingHourSchema = z.object({
    day: z.number().int().min(0).max(6),
    closed: z.boolean(),
    open: timeString,
    close: timeString,
});

export const intakeServiceSchema = z.object({
    name: z.string().trim().min(1, "Vul een naam in").max(100),
    // Duur in minuten, prijs in centen
    duration: z.number().int().min(5).max(480),
    price: z.number().int().min(0).max(1_000_000),
});

export const wizardIntakeSchema = z.object({
    choice: z.literal("wizard"),
    logo: imageDataUrl.nullable(),
    photos: z.array(imageDataUrl).max(6, "Maximaal 6 foto's"),
    colors: z.object({
        primary: hexColor,
        secondary: hexColor,
        accent: hexColor,
    }),
    openingHours: z.array(openingHourSchema).length(7),
    services: z.array(intakeServiceSchema).min(1, "Voeg minimaal één dienst toe").max(50),
    extraInfo: z.string().trim().max(2000, "Houd het wat korter").optional(),
});

export const intakeSchema = z.discriminatedUnion("choice", [
    contactRequestSchema,
    wizardIntakeSchema,
]);

export type WizardIntake = z.infer<typeof wizardIntakeSchema>;

// ─── Kleurencombinaties voor de wizard ───────────────────────────────────────

export const COLOR_PALETTES = [
    { id: "zwart-goud", name: "Klassiek goud", primary: "#c9a227", secondary: "#1c1c1c", accent: "#f5f0e8" },
    { id: "zacht-roze", name: "Zacht roze", primary: "#d77fa1", secondary: "#2e2a2b", accent: "#fdf3f6" },
    { id: "fris-groen", name: "Fris groen", primary: "#2f7d5d", secondary: "#1f2937", accent: "#f0f7f3" },
    { id: "oceaanblauw", name: "Oceaanblauw", primary: "#2563eb", secondary: "#0f172a", accent: "#eff6ff" },
    { id: "terracotta", name: "Warm terracotta", primary: "#c4572e", secondary: "#3a2d28", accent: "#faf1ec" },
    { id: "lavendel", name: "Lavendel", primary: "#7c63c8", secondary: "#2b2640", accent: "#f5f2fb" },
    { id: "monochroom", name: "Minimal zwart-wit", primary: "#111111", secondary: "#555555", accent: "#fafafa" },
] as const;

export const DAY_NAMES = [
    "Maandag",
    "Dinsdag",
    "Woensdag",
    "Donderdag",
    "Vrijdag",
    "Zaterdag",
    "Zondag",
] as const;
