// Formulier-schema, stapconfiguratie en helpers voor de intake-wizard.
// Duur en prijs blijven strings in het formulier; conversie naar
// minuten/centen gebeurt bij het versturen.

import { z } from "zod";
import { DAY_NAMES } from "@/lib/intake-schema";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Kies een geldige kleur");

export const wizardFormSchema = z.object({
    logo: z.string().nullable(),
    photos: z.array(z.string()).max(6, "Maximaal 6 foto's"),
    palette: z.string().min(1, "Kies een kleurencombinatie"),
    primaryColor: hexColor,
    secondaryColor: hexColor,
    accentColor: hexColor,
    openingHours: z
        .array(
            z.object({
                closed: z.boolean(),
                open: z.string().regex(/^\d{2}:\d{2}$/, "Vul een tijd in"),
                close: z.string().regex(/^\d{2}:\d{2}$/, "Vul een tijd in"),
            })
        )
        .length(7),
    services: z
        .array(
            z.object({
                name: z.string().trim().min(1, "Vul een naam in"),
                duration: z
                    .string()
                    .regex(/^\d+$/, "Alleen hele minuten")
                    .refine((v) => parseInt(v) >= 5 && parseInt(v) <= 480, "Tussen 5 en 480 minuten"),
                price: z
                    .string()
                    .regex(/^\d+([.,]\d{1,2})?$/, "Bijv. 27,50"),
            })
        )
        .min(1, "Voeg minimaal één dienst toe"),
    extraInfo: z.string().max(2000, "Houd het wat korter").optional(),
});

export type WizardFormValues = z.infer<typeof wizardFormSchema>;

export const STEP_META: { title: string; subtitle: string }[] = [
    { title: "Heb je een logo?", subtitle: "Upload je logo, dan gebruiken we die op je pagina." },
    { title: "Foto's van je salon", subtitle: "Een paar mooie foto's maken je pagina persoonlijk." },
    { title: "Welke kleuren passen bij jouw salon?", subtitle: "Kies een combinatie of stel zelf iets samen." },
    { title: "Wat zijn je openingstijden?", subtitle: "Zet dagen aan of uit en vul je tijden in." },
    { title: "Welke diensten bied je aan?", subtitle: "Deze komen straks direct in je boekingssysteem." },
    { title: "Nog iets dat we moeten weten?", subtitle: "Wensen, stijl, dingen die je écht (niet) wilt." },
];

export const TOTAL_STEPS = STEP_META.length;

// Velden die per stap gevalideerd worden
export const STEP_FIELDS: Record<number, (keyof WizardFormValues)[]> = {
    0: ["logo"],
    1: ["photos"],
    2: ["palette", "primaryColor", "secondaryColor", "accentColor"],
    3: ["openingHours"],
    4: ["services"],
    5: ["extraInfo"],
};

export function wizardDefaultValues(): WizardFormValues {
    return {
        logo: null,
        photos: [],
        palette: "",
        primaryColor: "#2563eb",
        secondaryColor: "#0f172a",
        accentColor: "#eff6ff",
        openingHours: DAY_NAMES.map((_, index) => ({
            closed: index === 6, // zondag standaard dicht
            open: "09:00",
            close: "17:30",
        })),
        services: [{ name: "", duration: "30", price: "" }],
        extraInfo: "",
    };
}

// Verkleint een afbeelding client-side en geeft een data-URL terug;
// tijdelijke opslag in de database tot er objectopslag gekoppeld is
export async function fileToDataUrl(file: File, maxDim: number): Promise<string> {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const isPng = file.type === "image/png";
    return canvas.toDataURL(isPng ? "image/png" : "image/jpeg", 0.82);
}

// Vertaalt de formulierwaarden naar de payload van /api/order/intake
export function buildIntakePayload(values: WizardFormValues) {
    return {
        choice: "wizard" as const,
        logo: values.logo,
        photos: values.photos,
        colors: {
            primary: values.primaryColor,
            secondary: values.secondaryColor,
            accent: values.accentColor,
        },
        openingHours: values.openingHours.map((hour, index) => ({
            day: index,
            closed: hour.closed,
            open: hour.open,
            close: hour.close,
        })),
        services: values.services.map((service) => ({
            name: service.name.trim(),
            duration: parseInt(service.duration),
            price: Math.round(parseFloat(service.price.replace(",", ".")) * 100),
        })),
        extraInfo: values.extraInfo?.trim() || undefined,
    };
}
