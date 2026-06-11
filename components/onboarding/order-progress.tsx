"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Check,
    ClipboardList,
    ExternalLink,
    Loader2,
    Mail,
    MessageCircle,
    PartyPopper,
    Phone,
    ThumbsUp,
    Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { ChoiceBlock } from "@/components/order-form/choice-block";
import { formatEuro, type PaymentPlan } from "@/lib/pricing";
import {
    CONTACT_METHODS,
    CONTACT_METHOD_LABELS,
    type ContactMethod,
} from "@/lib/intake-schema";
import { OrderFeedbackForm } from "./order-feedback-form";
import { IntakeWizard } from "./intake-wizard";

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

// Meldingen voor Mollie-statussen waarbij de betaling niet doorging
const PAYMENT_FAILURE_NOTES: Record<string, string> = {
    failed: "Je vorige betaling is mislukt. Probeer het gerust opnieuw.",
    canceled: "Je vorige betaling is geannuleerd. Probeer het gerust opnieuw.",
    expired: "Je vorige betaalsessie is verlopen. Probeer het gerust opnieuw.",
};

const CONTACT_METHOD_ICONS: Record<ContactMethod, typeof Mail> = {
    email: Mail,
    phone: Phone,
    video: Video,
};

const STEPS = [
    { title: "Aanvraag ontvangen" },
    { title: "Pagina wordt gebouwd" },
    { title: "Preview goedkeuren" },
    { title: "Betaling" },
    { title: "Live gaan" },
];

// Welke stap actief is per orderstatus (de stappen ervoor zijn afgerond)
const ACTIVE_STEP: Record<Exclude<OrderProgressInfo["status"], "ACTIVE" | "CANCELLED">, number> = {
    PENDING: 1,
    PREVIEW_SENT: 2,
    APPROVED: 3,
    PAID: 4,
};

export function OrderProgress({ order }: { order: OrderProgressInfo }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    // Intakekeuze bij PENDING: wizard zelf invullen of contact aanvragen
    const [intakeMode, setIntakeMode] = useState<"choice" | "wizard" | "contact">("choice");
    const [contactMethod, setContactMethod] = useState<ContactMethod | null>(null);

    if (order.status === "CANCELLED") {
        return (
            <main className="flex min-h-svh flex-col items-center justify-center px-6 py-16 text-center">
                <Logo size="lg" />
                <h1 className="mt-8 text-2xl font-semibold tracking-tight">
                    Je aanvraag is geannuleerd
                </h1>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Toch bedacht, of was het een vergissing? Stuur ons een berichtje
                    en we pakken je aanvraag zo weer op.
                </p>
                <Button asChild variant="outline" className="mt-6">
                    <a href="mailto:support@bloqk.nl">Mail support@bloqk.nl</a>
                </Button>
            </main>
        );
    }

    // Wizard neemt het hele scherm over
    if (order.status === "PENDING" && !order.intakeChoice && intakeMode === "wizard") {
        return (
            <IntakeWizard
                salonName={order.salonName}
                onCancel={() => setIntakeMode("choice")}
                onDone={() => {
                    setIntakeMode("choice");
                    router.refresh();
                }}
            />
        );
    }

    const activeStep = ACTIVE_STEP[order.status as keyof typeof ACTIVE_STEP] ?? 1;
    // Betaling wacht op externe bevestiging (bijv. overboeking)
    const paymentInProgress =
        order.lastPaymentStatus === "pending" ||
        order.lastPaymentStatus === "authorized";
    const paymentFailureNote = order.lastPaymentStatus
        ? PAYMENT_FAILURE_NOTES[order.lastPaymentStatus] ?? null
        : null;

    async function requestContact() {
        if (!contactMethod) {
            setError("Kies hoe we contact mogen opnemen");
            return;
        }
        setBusy(true);
        setError(null);
        const res = await fetch("/api/order/intake", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ choice: "call", contactMethod }),
        });
        if (!res.ok) {
            setError("Er ging iets mis. Probeer het opnieuw.");
            setBusy(false);
            return;
        }
        router.refresh();
    }

    async function approve() {
        setBusy(true);
        setError(null);
        const res = await fetch("/api/order/approve", { method: "POST" });
        if (!res.ok) {
            setError("Er ging iets mis. Probeer het opnieuw.");
            setBusy(false);
            return;
        }
        router.refresh();
    }

    async function pay() {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch("/api/order/pay", { method: "POST" });
            const data = await res.json();
            if (!res.ok || !data.checkoutUrl) {
                setError(data.error || "De betaling kon niet worden gestart.");
                setBusy(false);
                return;
            }
            window.location.href = data.checkoutUrl;
        } catch {
            setError("De betaling kon niet worden gestart. Probeer het opnieuw.");
            setBusy(false);
        }
    }

    return (
        <main className="flex min-h-svh flex-col items-center px-6 py-16">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-xl"
            >
                <div className="flex flex-col items-center gap-3 text-center">
                    <Logo size="lg" />
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        We zijn voor je aan de slag
                    </h1>
                    <p className="max-w-md text-sm text-muted-foreground sm:text-base">
                        {order.salonName} komt eraan. Hieronder zie je precies waar we
                        staan, je hoeft verder niets te doen tenzij er een stap voor
                        jou klaarstaat.
                    </p>
                </div>

                <div className="mt-10 flex flex-col">
                    {STEPS.map((step, index) => {
                        const isDone = index < activeStep;
                        const isActive = index === activeStep;
                        const isLast = index === STEPS.length - 1;

                        return (
                            <div key={step.title} className="flex gap-4">
                                {/* Icon + verbindingslijn */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={cn(
                                            "flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                            isDone && "border-primary bg-primary text-primary-foreground",
                                            isActive && "border-primary bg-primary/10 text-primary",
                                            !isDone && !isActive && "border-border bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {isDone ? (
                                            <Check className="size-4" strokeWidth={3} />
                                        ) : isActive ? (
                                            <span className="relative flex size-2.5">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                                                <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
                                            </span>
                                        ) : (
                                            <span className="size-2.5 rounded-full bg-border" />
                                        )}
                                    </div>
                                    {!isLast && (
                                        <div
                                            className={cn(
                                                "w-0.5 flex-1 rounded-full",
                                                isDone ? "bg-primary" : "bg-border"
                                            )}
                                        />
                                    )}
                                </div>

                                {/* Stapinhoud */}
                                <div className={cn("flex-1 pb-8", isLast && "pb-0")}>
                                    <p
                                        className={cn(
                                            "pt-1.5 text-sm font-semibold",
                                            !isDone && !isActive && "text-muted-foreground font-medium"
                                        )}
                                    >
                                        {step.title}
                                    </p>

                                    {isActive && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.25, ease: "easeOut" }}
                                            className="mt-3 rounded-2xl border bg-card p-4 sm:p-5"
                                        >
                                            {order.status === "PENDING" &&
                                                (order.intakeChoice === "wizard" ? (
                                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                                        Bedankt voor het invullen! We bouwen nu je
                                                        pagina en sturen je binnen 48 uur een preview
                                                        ter goedkeuring.
                                                    </p>
                                                ) : order.intakeChoice === "call" ? (
                                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                                        We nemen binnen 24 uur contact met je op
                                                        {order.contactMethod
                                                            ? ` (${CONTACT_METHOD_LABELS[
                                                                  order.contactMethod as ContactMethod
                                                              ]?.toLowerCase() ?? order.contactMethod})`
                                                            : ""}{" "}
                                                        om alles door te nemen. Daarna gaan we direct
                                                        voor je aan de slag.
                                                    </p>
                                                ) : intakeMode === "contact" ? (
                                                    <div className="flex flex-col gap-4">
                                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                                            Goed plan! Hoe mogen we contact met je
                                                            opnemen?
                                                        </p>
                                                        <div className="flex flex-col gap-2.5">
                                                            {CONTACT_METHODS.map((method) => (
                                                                <ChoiceBlock
                                                                    key={method}
                                                                    icon={CONTACT_METHOD_ICONS[method]}
                                                                    label={CONTACT_METHOD_LABELS[method]}
                                                                    selected={contactMethod === method}
                                                                    onSelect={() => setContactMethod(method)}
                                                                />
                                                            ))}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button
                                                                onClick={requestContact}
                                                                disabled={busy}
                                                                className="cursor-pointer"
                                                            >
                                                                {busy ? (
                                                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                                                ) : null}
                                                                Vraag contact aan
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                disabled={busy}
                                                                onClick={() => setIntakeMode("choice")}
                                                                className="cursor-pointer text-muted-foreground"
                                                            >
                                                                Terug
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-4">
                                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                                            Je aanvraag is binnen! Hoe wil je de
                                                            informatie voor je pagina aanleveren?
                                                        </p>
                                                        <div className="flex flex-col gap-2.5">
                                                            <ChoiceBlock
                                                                icon={ClipboardList}
                                                                label="Zelf invullen"
                                                                description="Doorloop een korte wizard: logo, foto's, kleuren, openingstijden en diensten. Duurt ±5 minuten."
                                                                selected={false}
                                                                onSelect={() => setIntakeMode("wizard")}
                                                            />
                                                            <ChoiceBlock
                                                                icon={MessageCircle}
                                                                label="Liever overleggen"
                                                                description="We nemen binnen 24 uur contact met je op en nemen alles samen door."
                                                                selected={false}
                                                                onSelect={() => setIntakeMode("contact")}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}

                                            {order.status === "PREVIEW_SENT" && (
                                                <div className="flex flex-col gap-4">
                                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                                        Je pagina staat klaar! Bekijk de preview en
                                                        laat weten wat je ervan vindt.
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {order.previewUrl ? (
                                                            <Button asChild variant="outline" className="cursor-pointer">
                                                                <a
                                                                    href={order.previewUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <ExternalLink className="mr-2 size-4" />
                                                                    Bekijk preview
                                                                </a>
                                                            </Button>
                                                        ) : null}
                                                        <Button
                                                            onClick={approve}
                                                            disabled={busy}
                                                            className="cursor-pointer"
                                                        >
                                                            {busy ? (
                                                                <Loader2 className="mr-2 size-4 animate-spin" />
                                                            ) : (
                                                                <ThumbsUp className="mr-2 size-4" />
                                                            )}
                                                            Goedkeuren
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            disabled={busy}
                                                            onClick={() => setFeedbackOpen(true)}
                                                            className="cursor-pointer text-muted-foreground"
                                                        >
                                                            Ik wil iets anders
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {order.status === "APPROVED" && (
                                                <div className="flex flex-col gap-4">
                                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                                        Goedgekeurd! Rond de betaling af, daarna
                                                        zetten we {order.salonName} live.
                                                    </p>
                                                    {order.payment ? (
                                                        <>
                                                            {/* Opbouw van het bedrag */}
                                                            <div className="divide-y overflow-hidden rounded-xl border bg-background">
                                                                {order.payment.lines.map((line) => (
                                                                    <div
                                                                        key={line.label}
                                                                        className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                                                                    >
                                                                        <span className="text-muted-foreground">
                                                                            {line.label}
                                                                        </span>
                                                                        <span className="font-medium tabular-nums">
                                                                            {formatEuro(line.amount)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                                <div className="flex items-center justify-between gap-3 bg-muted/50 px-4 py-2.5 text-sm font-semibold">
                                                                    <span>Nu te betalen</span>
                                                                    <span className="tabular-nums">
                                                                        {formatEuro(order.payment.dueNow)}
                                                                    </span>
                                                                </div>
                                                                {order.payment.recurring.map((line) => (
                                                                    <div
                                                                        key={line.label}
                                                                        className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs text-muted-foreground"
                                                                    >
                                                                        <span>{line.label}</span>
                                                                        <span className="tabular-nums">
                                                                            {formatEuro(line.amount)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <p className="text-xs leading-relaxed text-muted-foreground">
                                                                {order.payment.afterNote}
                                                            </p>
                                                            <p className="rounded-xl bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
                                                                0% commissie op boekingen — elke euro
                                                                die je klanten betalen is voor jou.
                                                            </p>
                                                            {paymentFailureNote && (
                                                                <p className="text-sm font-medium text-destructive">
                                                                    {paymentFailureNote}
                                                                </p>
                                                            )}
                                                            {paymentInProgress ? (
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <Loader2 className="size-4 animate-spin" />
                                                                    We wachten op de bevestiging van je
                                                                    betaling. Dit kan even duren, je
                                                                    hoeft niets te doen.
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <Button
                                                                        onClick={pay}
                                                                        disabled={busy}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        {busy ? (
                                                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                                                        ) : null}
                                                                        Betalen ({formatEuro(order.payment.dueNow)})
                                                                    </Button>
                                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                                        Je wordt veilig doorgestuurd naar
                                                                        onze betaalpagina.
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                                            Maatwerk heeft geen vaste prijs; we nemen
                                                            contact met je op om de betaling af te
                                                            ronden.
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {order.status === "PAID" && (
                                                <div className="flex items-start gap-3">
                                                    <PartyPopper className="mt-0.5 size-5 shrink-0 text-primary" />
                                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                                        Betaling ontvangen! We zetten {order.salonName}{" "}
                                                        nu live. Je krijgt bericht zodra alles online
                                                        staat, daarna opent je dashboard hier vanzelf.
                                                    </p>
                                                </div>
                                            )}

                                            {error && (
                                                <p className="mt-3 text-sm font-medium text-destructive">
                                                    {error}
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <p className="mt-10 text-center text-xs text-muted-foreground">
                    Vragen tussendoor? Mail{" "}
                    <a
                        href="mailto:support@bloqk.nl"
                        className="font-medium text-primary hover:underline"
                    >
                        support@bloqk.nl
                    </a>
                </p>
            </motion.div>

            <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Wat wil je anders?</DialogTitle>
                        <DialogDescription>
                            Geen probleem, daar is deze stap voor. Laat weten wat er
                            speelt, dan gaan we ermee aan de slag.
                        </DialogDescription>
                    </DialogHeader>
                    <OrderFeedbackForm
                        onSuccess={() => {
                            setFeedbackOpen(false);
                            router.refresh();
                        }}
                    />
                </DialogContent>
            </Dialog>
        </main>
    );
}
