"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, PartyPopper } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import type { ContactMethod } from "@/lib/intake-schema";
import { OrderFeedbackForm } from "./order-feedback-form";
import { IntakeWizard } from "./intake-wizard";
import {
    ACTIVE_STEP,
    PAYMENT_FAILURE_NOTES,
    STEPS,
    type OrderProgressInfo,
} from "./progress/progress-config";
import { CancelledScreen } from "./progress/cancelled-screen";
import { PendingStep } from "./progress/pending-step";
import { PreviewStep } from "./progress/preview-step";
import { PaymentStep } from "./progress/payment-step";

export type { OrderProgressInfo } from "./progress/progress-config";

export function OrderProgress({ order }: { order: OrderProgressInfo }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    // Intakekeuze bij PENDING: wizard zelf invullen of contact aanvragen
    const [intakeMode, setIntakeMode] = useState<"choice" | "wizard" | "contact">("choice");
    const [contactMethod, setContactMethod] = useState<ContactMethod | null>(null);

    if (order.status === "CANCELLED") {
        return <CancelledScreen />;
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

    function renderActiveStep() {
        switch (order.status) {
            case "PENDING":
                return (
                    <PendingStep
                        order={order}
                        intakeMode={intakeMode === "contact" ? "contact" : "choice"}
                        contactMethod={contactMethod}
                        busy={busy}
                        onChooseWizard={() => setIntakeMode("wizard")}
                        onChooseContact={() => setIntakeMode("contact")}
                        onBackToChoice={() => setIntakeMode("choice")}
                        onSelectMethod={setContactMethod}
                        onRequestContact={requestContact}
                    />
                );

            case "PREVIEW_SENT":
                return (
                    <PreviewStep
                        previewUrl={order.previewUrl}
                        busy={busy}
                        onApprove={approve}
                        onFeedback={() => setFeedbackOpen(true)}
                    />
                );

            case "APPROVED":
                return (
                    <PaymentStep
                        salonName={order.salonName}
                        payment={order.payment}
                        failureNote={paymentFailureNote}
                        inProgress={paymentInProgress}
                        busy={busy}
                        onPay={pay}
                    />
                );

            case "PAID":
                return (
                    <div className="flex items-start gap-3">
                        <PartyPopper className="mt-0.5 size-5 shrink-0 text-primary" />
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Betaling ontvangen! We zetten {order.salonName} nu live.
                            Je krijgt bericht zodra alles online staat, daarna opent
                            je dashboard hier vanzelf.
                        </p>
                    </div>
                );

            default:
                return null;
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
                                            {renderActiveStep()}

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
