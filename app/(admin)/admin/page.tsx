import { ExternalLink, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import prismadb from "@/lib/prismadb";
import { FEEDBACK_REASON_LABELS, type FeedbackReason } from "@/lib/order-schema";
import type { OrderStatus } from "@/prisma/generated/prisma/client";

const STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING: "Nieuw / bouwen",
    PREVIEW_SENT: "Preview verstuurd",
    APPROVED: "Goedgekeurd",
    PAID: "Betaald",
    ACTIVE: "Live",
    CANCELLED: "Geannuleerd",
};

const STATUS_STYLES: Record<OrderStatus, string> = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    PREVIEW_SENT: "bg-blue-100 text-blue-800 border-blue-200",
    APPROVED: "bg-violet-100 text-violet-800 border-violet-200",
    PAID: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ACTIVE: "bg-primary/10 text-primary border-primary/20",
    CANCELLED: "bg-muted text-muted-foreground border-border",
};

// Volgorde waarin statussen aandacht vragen in het overzicht
const STATUS_ORDER: OrderStatus[] = [
    "PENDING",
    "PREVIEW_SENT",
    "APPROVED",
    "PAID",
    "ACTIVE",
    "CANCELLED",
];

const dateFormatter = new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

export default async function AdminPage() {
    const orders = await prismadb.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { name: true, email: true, phone: true } },
        },
    });

    const counts = STATUS_ORDER.map((status) => ({
        status,
        count: orders.filter((order) => order.status === status).length,
    }));

    return (
        <main className="mx-auto w-full max-w-6xl px-6 py-10">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <Logo size="sm" />
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight">
                        Aanvragen
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Alle binnengekomen orders, nieuwste eerst.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {counts.map(({ status, count }) => (
                        <div
                            key={status}
                            className={cn(
                                "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                                STATUS_STYLES[status]
                            )}
                        >
                            {STATUS_LABELS[status]}
                            <span className="font-semibold">{count}</span>
                        </div>
                    ))}
                </div>
            </header>

            <div className="mt-8 overflow-hidden rounded-2xl border bg-card">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-20 text-center">
                        <Inbox className="size-8 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                            Nog geen aanvragen. Zodra iemand de onboarding doorloopt,
                            verschijnt de order hier.
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Salon</TableHead>
                                <TableHead>Klant</TableHead>
                                <TableHead>Pakket</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Feedback</TableHead>
                                <TableHead>Preview</TableHead>
                                <TableHead className="text-right">Aangevraagd</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{order.salonName}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {order.salonType}
                                                {order.address ? ` · ${order.address}` : ""}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{order.user.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {order.user.email}
                                                {order.user.phone ? ` · ${order.user.phone}` : ""}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">{order.package}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={cn("border", STATUS_STYLES[order.status])}
                                        >
                                            {STATUS_LABELS[order.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-56">
                                        {order.feedbackReason ? (
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium">
                                                    {FEEDBACK_REASON_LABELS[
                                                        order.feedbackReason as FeedbackReason
                                                    ] ?? order.feedbackReason}
                                                </span>
                                                {order.feedbackMessage ? (
                                                    <span
                                                        className="truncate text-xs text-muted-foreground"
                                                        title={order.feedbackMessage}
                                                    >
                                                        {order.feedbackMessage}
                                                    </span>
                                                ) : null}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {order.previewUrl ? (
                                            <a
                                                href={order.previewUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                            >
                                                <ExternalLink className="size-3" />
                                                Bekijken
                                            </a>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground">
                                        {dateFormatter.format(order.createdAt)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </main>
    );
}
