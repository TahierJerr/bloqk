import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    SLA_ACTIVE_STATUSES,
    STATUS_LABELS,
    STATUS_STYLES,
} from "@/components/admin/order-status";
import { ContactRequestBanner } from "@/components/admin/contact-request-banner";
import { DetailSection } from "@/components/admin/detail-section";
import { OrderActions } from "@/components/admin/order-actions";
import { OrderWizardData } from "@/components/admin/order-wizard-data";
import { SlaTimer } from "@/components/admin/sla-timer";
import { cn } from "@/lib/utils";
import prismadb from "@/lib/prismadb";
import {
    BILLING_LABELS,
    FEEDBACK_REASON_LABELS,
    type Billing,
    type FeedbackReason,
} from "@/lib/order-schema";

const dateFormatter = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

export default async function AdminOrderPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const order = await prismadb.order.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
        },
    });
    if (!order) notFound();

    // Salon + wizardgegevens van de eigenaar
    const salon = await prismadb.salon.findUnique({
        where: { ownerId: order.user.id },
        include: {
            settings: { include: { openingHours: { orderBy: { dayOfWeek: "asc" } } } },
            services: { orderBy: { createdAt: "asc" } },
        },
    });
    const settings = salon?.settings;

    return (
        <main className="mx-auto w-full max-w-4xl px-6 py-10">
            <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
                <Link href="/admin">
                    <ArrowLeft className="mr-2 size-4" />
                    Alle aanvragen
                </Link>
            </Button>

            <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {order.salonName}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {order.salonType} · {order.package}
                        {order.address ? ` · ${order.address}` : ""}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Badge
                        variant="outline"
                        className={cn("border", STATUS_STYLES[order.status])}
                    >
                        {STATUS_LABELS[order.status]}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                        Binnengekomen:{" "}
                        <SlaTimer
                            since={order.createdAt.toISOString()}
                            active={SLA_ACTIVE_STATUSES.includes(order.status)}
                        />{" "}
                        geleden
                    </p>
                </div>
            </header>

            <div className="mt-8 flex flex-col gap-5">
                {/* Contactverzoek: opvallend bovenaan */}
                {order.intakeChoice === "call" && (
                    <ContactRequestBanner
                        contactMethod={order.contactMethod}
                        customerName={order.user.name}
                        customerEmail={order.user.email}
                        customerPhone={order.user.phone}
                        requestedAt={order.intakeCompletedAt}
                    />
                )}

                {order.intakeChoice === null && (
                    <section className="flex items-center gap-3 rounded-2xl border bg-muted/40 p-5 text-sm text-muted-foreground">
                        <MessageCircle className="size-4 shrink-0" />
                        De klant heeft de intake nog niet gedaan (wizard of contactverzoek).
                    </section>
                )}

                <DetailSection title="Acties">
                    <OrderActions
                        orderId={order.id}
                        status={order.status}
                        previewUrl={order.previewUrl}
                    />
                    {order.previewUrl ? (
                        <p className="mt-3 text-xs text-muted-foreground">
                            Huidige preview:{" "}
                            <a
                                href={order.previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                            >
                                {order.previewUrl}
                                <ExternalLink className="size-3" />
                            </a>
                        </p>
                    ) : null}
                </DetailSection>

                <DetailSection title="Klant">
                    <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-muted-foreground">Naam</dt>
                            <dd className="font-medium">{order.user.name}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">E-mail</dt>
                            <dd className="font-medium">{order.user.email}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Telefoon</dt>
                            <dd className="font-medium">{order.user.phone || "—"}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Aanvraag</dt>
                            <dd className="font-medium">
                                {dateFormatter.format(order.createdAt)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Facturering</dt>
                            <dd className="font-medium">
                                {order.billing
                                    ? BILLING_LABELS[order.billing as Billing] ?? order.billing
                                    : "—"}
                                {order.lastPaymentStatus
                                    ? ` · betaling: ${order.lastPaymentStatus}`
                                    : ""}
                            </dd>
                        </div>
                        {salon?.domain ? (
                            <div>
                                <dt className="text-muted-foreground">Domein</dt>
                                <dd className="font-medium">{salon.domain}</dd>
                            </div>
                        ) : null}
                    </dl>
                </DetailSection>

                {/* Domeinbeheer (alleen bij een meegebracht eigen domein) */}
                {order.domainSource === "existing" && salon?.domain ? (
                    <DetailSection title={`Domeinbeheer — ${salon.domain}`}>
                        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-muted-foreground">Keuze van de klant</dt>
                                <dd className="font-medium">
                                    {order.dnsChoice === "managed"
                                        ? "Bloqk beheert het domein"
                                        : order.dnsChoice === "self"
                                            ? "Klant beheert zelf (DNS-instellingen getoond)"
                                            : "Nog geen keuze gemaakt"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Verhuiscode (EPP)</dt>
                                <dd className="font-medium">
                                    {order.eppCode ? (
                                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                            {order.eppCode}
                                        </code>
                                    ) : (
                                        "Nog niet ontvangen"
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Overdracht TransIP</dt>
                                <dd className="font-medium">
                                    {order.transferRequestedAt
                                        ? `Aangevraagd op ${dateFormatter.format(order.transferRequestedAt)}`
                                        : order.dnsChoice === "managed" && order.eppCode
                                            ? "⚠ Nog niet gelukt — handmatig oppakken"
                                            : "—"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Cloudflare-zone</dt>
                                <dd className="font-medium">
                                    {order.cloudflareZoneId ? (
                                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                            {order.cloudflareZoneId}
                                        </code>
                                    ) : order.dnsChoice === "managed" && order.eppCode ? (
                                        "⚠ Nog niet aangemaakt"
                                    ) : (
                                        "—"
                                    )}
                                </dd>
                            </div>
                        </dl>
                    </DetailSection>
                ) : null}

                {order.feedbackReason ? (
                    <DetailSection title="Laatste feedback op de preview">
                        <p className="text-sm font-medium">
                            {FEEDBACK_REASON_LABELS[order.feedbackReason as FeedbackReason] ??
                                order.feedbackReason}
                        </p>
                        {order.feedbackMessage ? (
                            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                                {order.feedbackMessage}
                            </p>
                        ) : null}
                    </DetailSection>
                ) : null}

                {/* Wizardgegevens */}
                {order.intakeChoice === "wizard" && settings ? (
                    <OrderWizardData
                        settings={settings}
                        services={salon?.services ?? []}
                    />
                ) : null}
            </div>
        </main>
    );
}
