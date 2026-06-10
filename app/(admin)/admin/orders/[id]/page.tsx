import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    ExternalLink,
    Mail,
    MessageCircle,
    Phone,
    Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    SLA_ACTIVE_STATUSES,
    STATUS_LABELS,
    STATUS_STYLES,
} from "@/components/admin/order-status";
import { OrderActions } from "@/components/admin/order-actions";
import { SlaTimer } from "@/components/admin/sla-timer";
import { cn } from "@/lib/utils";
import prismadb from "@/lib/prismadb";
import {
    CONTACT_METHOD_LABELS,
    DAY_NAMES,
    type ContactMethod,
} from "@/lib/intake-schema";
import { FEEDBACK_REASON_LABELS, type FeedbackReason } from "@/lib/order-schema";

const dateFormatter = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {title}
            </h2>
            <div className="mt-4">{children}</div>
        </section>
    );
}

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

    const contactIcon =
        order.contactMethod === "phone" ? (
            <Phone className="size-5" />
        ) : order.contactMethod === "video" ? (
            <Video className="size-5" />
        ) : (
            <Mail className="size-5" />
        );

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
                    <section className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5">
                        <div className="flex items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                {contactIcon}
                            </span>
                            <div className="flex flex-col gap-1">
                                <p className="font-semibold text-blue-900">
                                    Deze klant wil dat je contact opneemt
                                    {order.contactMethod
                                        ? ` — ${CONTACT_METHOD_LABELS[
                                              order.contactMethod as ContactMethod
                                          ]?.toLowerCase() ?? order.contactMethod}`
                                        : ""}
                                </p>
                                <p className="text-sm text-blue-900/80">
                                    {order.user.name} ·{" "}
                                    <a className="underline" href={`mailto:${order.user.email}`}>
                                        {order.user.email}
                                    </a>
                                    {order.user.phone ? (
                                        <>
                                            {" "}·{" "}
                                            <a className="underline" href={`tel:${order.user.phone}`}>
                                                {order.user.phone}
                                            </a>
                                        </>
                                    ) : null}
                                </p>
                                {order.intakeCompletedAt ? (
                                    <p className="text-xs text-blue-900/60">
                                        Aangevraagd op {dateFormatter.format(order.intakeCompletedAt)} —
                                        beloofd: reactie binnen 24 uur.
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </section>
                )}

                {order.intakeChoice === null && (
                    <section className="flex items-center gap-3 rounded-2xl border bg-muted/40 p-5 text-sm text-muted-foreground">
                        <MessageCircle className="size-4 shrink-0" />
                        De klant heeft de intake nog niet gedaan (wizard of contactverzoek).
                    </section>
                )}

                <Section title="Acties">
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
                </Section>

                <Section title="Klant">
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
                        {salon?.domain ? (
                            <div>
                                <dt className="text-muted-foreground">Eigen domein</dt>
                                <dd className="font-medium">{salon.domain}</dd>
                            </div>
                        ) : null}
                    </dl>
                </Section>

                {order.feedbackReason ? (
                    <Section title="Laatste feedback op de preview">
                        <p className="text-sm font-medium">
                            {FEEDBACK_REASON_LABELS[order.feedbackReason as FeedbackReason] ??
                                order.feedbackReason}
                        </p>
                        {order.feedbackMessage ? (
                            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                                {order.feedbackMessage}
                            </p>
                        ) : null}
                    </Section>
                ) : null}

                {/* Wizardgegevens */}
                {order.intakeChoice === "wizard" && settings ? (
                    <>
                        <Section title="Branding (uit de wizard)">
                            <div className="flex flex-col gap-5">
                                <div>
                                    <p className="mb-2 text-xs text-muted-foreground">Logo</p>
                                    {settings.logoUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={settings.logoUrl}
                                            alt="Logo van de salon"
                                            className="max-h-32 rounded-xl border bg-background object-contain p-3"
                                        />
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Geen logo geüpload — tekstvariant maken.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <p className="mb-2 text-xs text-muted-foreground">Kleuren</p>
                                    <div className="flex gap-3">
                                        {[
                                            ["Hoofdkleur", settings.primaryColor],
                                            ["Tweede kleur", settings.secondaryColor],
                                            ["Achtergrond", settings.accentColor],
                                        ].map(([label, color]) =>
                                            color ? (
                                                <div key={label} className="flex flex-col items-center gap-1.5">
                                                    <span
                                                        className="size-10 rounded-full border"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                    <span className="text-xs text-muted-foreground">
                                                        {label}
                                                    </span>
                                                    <code className="text-[10px] text-muted-foreground">
                                                        {color}
                                                    </code>
                                                </div>
                                            ) : null
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-2 text-xs text-muted-foreground">
                                        Foto&apos;s ({settings.photoUrls.length})
                                    </p>
                                    {settings.photoUrls.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                                            {settings.photoUrls.map((photo, index) => (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    key={index}
                                                    src={photo}
                                                    alt={`Salonfoto ${index + 1}`}
                                                    className="aspect-square rounded-xl border object-cover"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Geen foto&apos;s geüpload.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Section>

                        <Section title="Openingstijden">
                            <div className="divide-y text-sm">
                                {settings.openingHours.map((hour) => (
                                    <div
                                        key={hour.id}
                                        className="flex items-center justify-between py-2"
                                    >
                                        <span className="font-medium">
                                            {DAY_NAMES[hour.dayOfWeek] ?? `Dag ${hour.dayOfWeek}`}
                                        </span>
                                        <span
                                            className={cn(
                                                hour.closed
                                                    ? "text-muted-foreground"
                                                    : "tabular-nums"
                                            )}
                                        >
                                            {hour.closed ? "Gesloten" : `${hour.open} – ${hour.close}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <Section title={`Diensten (${salon?.services.length ?? 0})`}>
                            <div className="divide-y text-sm">
                                {salon?.services.map((service) => (
                                    <div
                                        key={service.id}
                                        className="flex items-center justify-between gap-3 py-2"
                                    >
                                        <span className="font-medium">{service.name}</span>
                                        <span className="shrink-0 text-muted-foreground">
                                            {service.duration} min · €
                                            {(service.price / 100).toFixed(2).replace(".", ",")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {settings.extraInfo ? (
                            <Section title="Extra info / wensen">
                                <p className="whitespace-pre-wrap text-sm">{settings.extraInfo}</p>
                            </Section>
                        ) : null}
                    </>
                ) : null}
            </div>
        </main>
    );
}
