// Configuratie voor de voortgangstijdlijn die klanten zien tot hun
// salon live (ACTIVE) is.

import { Mail, Phone, Video } from "lucide-react";
import type { PaymentPlan } from "@/lib/pricing";
import type { ContactMethod } from "@/lib/intake-schema";

export type OrderProgressInfo = {
    id: string;
    status: "PENDING" | "PREVIEW_SENT" | "APPROVED" | "PAID" | "ACTIVE" | "CANCELLED";
    previewUrl: string | null;
    package: string;
    salonName: string;
    intakeChoice: string | null;
    contactMethod: string | null;
    billing: string | null;
    lastPaymentStatus: string | null;
    // Server-side berekend uit de actuele prijsconfiguratie
    payment: PaymentPlan | null;
};

export const STEPS = [
    { title: "Aanvraag ontvangen" },
    { title: "Pagina wordt gebouwd" },
    { title: "Preview goedkeuren" },
    { title: "Betaling" },
    { title: "Live gaan" },
];

// Welke stap actief is per orderstatus (de stappen ervoor zijn afgerond)
export const ACTIVE_STEP: Record<
    Exclude<OrderProgressInfo["status"], "ACTIVE" | "CANCELLED">,
    number
> = {
    PENDING: 1,
    PREVIEW_SENT: 2,
    APPROVED: 3,
    PAID: 4,
};

// Meldingen voor Mollie-statussen waarbij de betaling niet doorging
export const PAYMENT_FAILURE_NOTES: Record<string, string> = {
    failed: "Je vorige betaling is mislukt. Probeer het gerust opnieuw.",
    canceled: "Je vorige betaling is geannuleerd. Probeer het gerust opnieuw.",
    expired: "Je vorige betaalsessie is verlopen. Probeer het gerust opnieuw.",
};

export const CONTACT_METHOD_ICONS: Record<ContactMethod, typeof Mail> = {
    email: Mail,
    phone: Phone,
    video: Video,
};
