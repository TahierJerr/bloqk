import type { OrderStatus } from "@/prisma/generated/prisma/client";

export const STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING: "Nieuw / bouwen",
    PREVIEW_SENT: "Preview verstuurd",
    APPROVED: "Goedgekeurd",
    PAID: "Betaald",
    ACTIVE: "Live",
    CANCELLED: "Geannuleerd",
};

export const STATUS_STYLES: Record<OrderStatus, string> = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    PREVIEW_SENT: "bg-blue-100 text-blue-800 border-blue-200",
    APPROVED: "bg-violet-100 text-violet-800 border-violet-200",
    PAID: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ACTIVE: "bg-primary/10 text-primary border-primary/20",
    CANCELLED: "bg-muted text-muted-foreground border-border",
};

// Volgorde waarin statussen aandacht vragen in het overzicht
export const STATUS_ORDER: OrderStatus[] = [
    "PENDING",
    "PREVIEW_SENT",
    "APPROVED",
    "PAID",
    "ACTIVE",
    "CANCELLED",
];

// Statussen waarin de bal bij ons ligt en de SLA-klok dus tikt
export const SLA_ACTIVE_STATUSES: OrderStatus[] = ["PENDING", "PREVIEW_SENT"];
