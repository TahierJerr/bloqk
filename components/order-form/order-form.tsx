"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
    ArrowLeft,
    ArrowRight,
    CalendarClock,
    Flower2,
    Gem,
    Hand,
    Loader2,
    MessageCircle,
    PartyPopper,
    Pencil,
    PenTool,
    Scissors,
    Server,
    Sparkles,
    Globe,
    Link as LinkIcon
} from "lucide-react";
import {
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    orderSchema,
    SALON_TYPES,
    type OrderFormValues,
    type Package,
    type SalonType,
} from "@/lib/order-schema";
import { ChoiceBlock } from "@/components/order-form/choice-block";
import { AddressAutocomplete } from "@/components/order-form/address-autocomplete";
import { ProgressBlocks } from "@/components/order-form/progress-blocks";
import { OnboardingSignUpForm } from "../auth/onboarding-sign-up-form";
import { authClient } from "@/lib/auth-client";

// 6 form steps (indices 0-5); the summary is the last one. The progress bar
// shows one extra step because the account step (auth) precedes the form.
const TOTAL_STEPS = 6;
const SUMMARY_STEP = 5;

const STEP_META: { title: string; subtitle: string }[] = [
    { title: "Wat voor salon heb je?", subtitle: "Kies wat het beste past." },
    { title: "Hoe heet je salon?", subtitle: "Zo verschijnt je naam straks in Bloqk." },
    { title: "Heb je al een website?", subtitle: "Koppel je eigen domein of claim een nieuwe." },
    { title: "Waar zit je salon?", subtitle: "We zoeken je adres op in de database." },
    { title: "Welk pakket past bij je?", subtitle: "Je zit nergens aan vast." },
    { title: "Klopt alles?", subtitle: "Controleer je gegevens en verstuur je aanvraag." },
];

const SALON_TYPE_ICONS: Record<SalonType, LucideIcon> = {
    "Kapsalons / barbershops": Scissors,
    "Nagelstudio's": Hand,
    Schoonheidssalons: Sparkles,
    Tattooshops: PenTool,
    "Piercingstudio's": Gem,
    Massagesalons: Flower2,
};

const PACKAGE_OPTIONS: {
    value: Package;
    description: string;
    icon: LucideIcon;
}[] = [
    {
        value: "Maandelijks abonnement",
        description: "Vast bedrag per maand, altijd up-to-date.",
        icon: CalendarClock,
    },
    {
        value: "Eenmalig + hosting",
        description: "Eén keer betalen, wij regelen de hosting.",
        icon: Server,
    },
    {
        value: "Ik wil eerst even praten",
        description: "Liever eerst overleggen? Wij bellen je gratis.",
        icon: MessageCircle,
    },
];

const STEP_FIELDS: Record<number, (keyof OrderFormValues)[]> = {
    0: ["salonType"],
    1: ["salonName"],
    2: ["hasDomain", "customDomain"],
    3: ["address"],
    4: ["package"],
};

export function OrderForm() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    // 1. Nieuwe state om de initiële laadactie bij te houden
    const [isAppReady, setIsAppReady] = useState(false);

    // 2. Zodra isPending false wordt (app is geladen), blijft de app 'ready'
    useEffect(() => {
        if (!isPending) {
            setIsAppReady(true);
        }
    }, [isPending]);

    const shouldReduceMotion = useReducedMotion();
    const [[step, direction], setStep] = useState<[number, number]>([0, 0]);
    // Overbruggt het moment tussen succesvolle login en de sessie-refetch
    const [finishingAuth, setFinishingAuth] = useState(false);
    // Bij 'Wijzig' vanuit het overzicht gaat de volgende stap terug naar het overzicht
    const [returnToSummary, setReturnToSummary] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const form = useForm<OrderFormValues>({
        resolver: zodResolver(orderSchema),
        mode: "onTouched",
        defaultValues: {
            salonName: "",
            address: "",
        },
    });

    const {
        register,
        watch,
        setValue,
        trigger,
        clearErrors,
        getValues,
        formState: { errors },
    } = form;

    // eslint-disable-next-line react-hooks/incompatible-library
    const values = watch();

    // 3. Gebruik !isAppReady in plaats van isPending om unmount-glitches te voorkomen
    if (!isAppReady) {
        return (
            <div className="flex min-h-100 items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // AUTH WALL: Geïntegreerd in de onboarding flow (De Trojan Horse)
    if (!session) {
        return (
            <div className="mx-auto w-full max-w-xl">
                <CardHeader className="gap-4">
                    <ProgressBlocks current={0} total={TOTAL_STEPS + 1} />
                </CardHeader>

                {finishingAuth ? (
                    <div className="flex min-h-80 items-center justify-center">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <OnboardingSignUpForm
                        title="Laten we beginnen met je account"
                        description="Vul je gegevens in zodat we je workspace veilig kunnen aanmaken en je voortgang kunnen opslaan."
                        // Na het inloggen haalt useSession de sessie automatisch
                        // opnieuw op; tot die tijd tonen we een korte loader
                        onSuccess={() => setFinishingAuth(true)}
                        className="w-full mt-4"
                    />
                )}
            </div>
        );
    }

    function paginate(target: number) {
        setStep([target, target > step ? 1 : -1]);
    }

    async function goNext() {
        const fields = STEP_FIELDS[step];
        const valid = fields ? await trigger(fields) : true;
        if (!valid) return;
        if (returnToSummary) {
            setReturnToSummary(false);
            paginate(SUMMARY_STEP);
        } else {
            paginate(Math.min(step + 1, SUMMARY_STEP));
        }
    }

    function skipStep() {
        const fields = STEP_FIELDS[step];
        if (fields) {
            fields.forEach((field) => clearErrors(field));
        }
        if (returnToSummary) {
            setReturnToSummary(false);
            paginate(SUMMARY_STEP);
        } else {
            paginate(step + 1);
        }
    }

    function goBack() {
        // Tijdens een 'Wijzig' vanuit het overzicht gaat Terug naar het overzicht
        if (returnToSummary) {
            setReturnToSummary(false);
            paginate(SUMMARY_STEP);
            return;
        }
        if (step > 0) paginate(step - 1);
    }

    function editFromSummary(target: number) {
        setReturnToSummary(true);
        paginate(target);
    }

    function selectSalonType(value: SalonType) {
        setValue("salonType", value, { shouldValidate: true });
        setTimeout(() => goNext(), 300);
    }

    function selectPackage(value: Package) {
        setValue("package", value, { shouldValidate: true });
        setTimeout(() => goNext(), 300);
    }

    async function submitOrder() {
        setSubmitError(null);
        setSubmitting(true);
        try {
            const res = await fetch("/api/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(getValues()),
            });

            if (!res.ok) throw new Error();

            // Dopamine-hit success animation
            setShowSuccess(true);
            router.prefetch("/dashboard");
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
        } catch {
            setSubmitError(
                "Er ging iets mis bij het versturen. Probeer het opnieuw."
            );
            setSubmitting(false);
        }
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (step === SUMMARY_STEP) {
            void submitOrder();
        } else {
            void goNext();
        }
    }

    const variants = {
        enter: (dir: number) => ({
            opacity: 0,
            x: shouldReduceMotion ? 0 : dir > 0 ? 32 : -32,
        }),
        center: { opacity: 1, x: 0 },
        exit: (dir: number) => ({
            opacity: 0,
            x: shouldReduceMotion ? 0 : dir > 0 ? -32 : 32,
        }),
    };

    if (showSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto flex w-full max-w-xl flex-col items-center justify-center py-20 text-center"
            >
                <div className="mb-6 rounded-full bg-primary/10 p-5">
                    <PartyPopper className="size-14 text-primary" />
                </div>
                <h2 className="text-3xl font-semibold tracking-tight">Aanvraag succesvol!</h2>
                <p className="mt-3 max-w-sm text-muted-foreground">
                    Je workspace wordt voorbereid. We sturen je direct door naar je nieuwe dashboard...
                </p>
                <Loader2 className="mt-8 size-6 animate-spin text-muted-foreground/50" />
            </motion.div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-xl">
            <CardHeader className="gap-4">
                {/* De +1 is omdat de gebruiker stap 0 (Auth) al heeft gehad */}
                <ProgressBlocks current={step + 1} total={TOTAL_STEPS + 1} />
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="flex flex-col gap-1"
                >
                    <h2 className="text-2xl font-semibold tracking-tight">
                        {STEP_META[step]?.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {STEP_META[step]?.subtitle}
                    </p>
                </motion.div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent>
                    <div className="flex min-h-80 flex-col sm:min-h-104">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={step}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="flex-1"
                            >
                                {renderStep()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </CardContent>

                <CardFooter className="mt-6 flex-col gap-3">
                    {submitError ? (
                        <p className="w-full text-sm text-destructive">
                            {submitError}
                        </p>
                    ) : null}

                    <div className="flex w-full items-center justify-between gap-3">
                        {step > 0 ? (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={goBack}
                                disabled={submitting}
                                className="cursor-pointer text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="mr-2 size-4" />
                                Terug
                            </Button>
                        ) : <div />}

                        <div className="flex items-center gap-2">
                            {/* Toestaan om adres (3) of naam (1) over te slaan */}
                            {(step === 1 || step === 3) && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={skipStep}
                                    disabled={submitting}
                                    className="cursor-pointer font-normal text-muted-foreground"
                                >
                                    Overslaan
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="cursor-pointer"
                            >
                                {step === SUMMARY_STEP ? (
                                    submitting ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Versturen...
                                        </>
                                    ) : (
                                        "Aanvraag versturen"
                                    )
                                ) : (
                                    <>
                                        {returnToSummary ? "Naar overzicht" : "Volgende"}
                                        <ArrowRight className="ml-2 size-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardFooter>
            </form>
        </div>
    );

    function renderStep() {
        switch (step) {
            case 0:
                return (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:grid-cols-3">
                            {SALON_TYPES.map((type) => (
                                <ChoiceBlock
                                    key={type}
                                    icon={SALON_TYPE_ICONS[type]}
                                    label={type}
                                    selected={values.salonType === type}
                                    onSelect={() => selectSalonType(type)}
                                />
                            ))}
                        </div>
                        {errors.salonType ? (
                            <p className="text-sm text-destructive">
                                {errors.salonType.message}
                            </p>
                        ) : null}
                    </div>
                );

            case 1:
                return (
                    <FieldGroup>
                        <Field data-invalid={!!errors.salonName}>
                            <FieldLabel htmlFor="salonName">
                                Naam van je salon
                            </FieldLabel>
                            <Input
                                id="salonName"
                                placeholder="Bijv. Studio Knip"
                                aria-invalid={!!errors.salonName}
                                autoFocus
                                {...register("salonName")}
                            />
                            <FieldError errors={[errors.salonName]} />
                        </Field>
                    </FieldGroup>
                );

            case 2:
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <ChoiceBlock
                                icon={Globe}
                                label="Nee, ik wil een nieuw domein"
                                description="Wij regelen een gratis .bloqk.nl domein voor je."
                                selected={values.hasDomain === "no"}
                                onSelect={() => {
                                    setValue("hasDomain", "no", { shouldValidate: true });
                                    setValue("customDomain", "");
                                    setTimeout(() => goNext(), 300);
                                }}
                            />
                            <ChoiceBlock
                                icon={LinkIcon}
                                label="Ja, ik heb al een domein"
                                description="Koppel je bestaande website (bijv. salon.nl)."
                                selected={values.hasDomain === "yes"}
                                onSelect={() => setValue("hasDomain", "yes", { shouldValidate: true })}
                            />
                        </div>
                        {errors.hasDomain ? (
                            <p className="text-sm text-destructive">{errors.hasDomain.message}</p>
                        ) : null}

                        <AnimatePresence>
                            {values.hasDomain === "yes" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                >
                                    <FieldGroup>
                                        <Field data-invalid={!!errors.customDomain}>
                                            <FieldLabel htmlFor="customDomain">Wat is je domeinnaam?</FieldLabel>
                                            <Input
                                                id="customDomain"
                                                placeholder="bijv. www.mijn-salon.nl"
                                                aria-invalid={!!errors.customDomain}
                                                autoFocus
                                                {...register("customDomain")}
                                            />
                                            <FieldError errors={[errors.customDomain]} />
                                        </Field>
                                    </FieldGroup>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );

            case 3:
                return (
                    <Field data-invalid={!!errors.address}>
                        <FieldLabel>Adres</FieldLabel>
                        <AddressAutocomplete
                            value={values.address ?? ""}
                            onSelect={(address) =>
                                setValue("address", address, {
                                    shouldValidate: true,
                                })
                            }
                            invalid={!!errors.address}
                        />
                        <FieldError errors={[errors.address]} />
                    </Field>
                );

            case 4:
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            {PACKAGE_OPTIONS.map((option) => (
                                <ChoiceBlock
                                    key={option.value}
                                    icon={option.icon}
                                    label={option.value}
                                    description={option.description}
                                    selected={values.package === option.value}
                                    onSelect={() => selectPackage(option.value)}
                                />
                            ))}
                        </div>
                        {errors.package ? (
                            <p className="text-sm text-destructive">
                                {errors.package.message}
                            </p>
                        ) : null}
                    </div>
                );

            case SUMMARY_STEP:
                return <SummaryStep values={values} onEdit={editFromSummary} session={session!} />;

            default:
                return null;
        }
    }
}

function SummaryStep({
    values,
    onEdit,
    session,
}: {
    values: OrderFormValues;
    onEdit: (step: number) => void;
    session: { user: { name?: string | null; email?: string | null; phone?: string | null | undefined } };
}) {
    const rows: { label: string; value: string | null; step: number }[] = [
        { label: "Type", value: values.salonType ?? null, step: 0 },
        { label: "Salon", value: values.salonName || null, step: 1 },
        {
            label: "Domein",
            value: values.hasDomain === "yes"
                ? values.customDomain || null
                : (values.hasDomain === "no" ? "Nieuw domein via Bloqk" : null),
            step: 2,
        },
        { label: "Adres", value: values.address || null, step: 3 },
        { label: "Pakket", value: values.package ?? null, step: 4 },
    ];

    const accountRows: { label: string; value: string | null }[] = [
        { label: "Naam", value: session.user.name || null },
        { label: "E-mail", value: session.user.email || null },
        { label: "Telefoon", value: session.user.phone || null },
    ];

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="w-full divide-y overflow-hidden rounded-2xl border bg-card">
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className="flex items-start gap-4 px-4 py-3.5"
                    >
                        <span className="w-20 shrink-0 text-sm text-muted-foreground sm:w-24">
                            {row.label}
                        </span>
                        <span
                            className={cn(
                                "flex-1 text-sm wrap-break-word",
                                row.value
                                    ? "font-medium"
                                    : "italic text-muted-foreground"
                            )}
                        >
                            {row.value ?? "Niet opgegeven"}
                        </span>
                        <button
                            type="button"
                            onClick={() => onEdit(row.step)}
                            aria-label={`${row.label} wijzigen`}
                            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                        >
                            <Pencil className="size-3" />
                            Wijzig
                        </button>
                    </div>
                ))}
            </div>

            <div className="w-full overflow-hidden rounded-2xl border bg-muted/40">
                <p className="border-b px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Je account
                </p>
                <div className="divide-y">
                    {accountRows.map((row) => (
                        <div
                            key={row.label}
                            className="flex items-start gap-4 px-4 py-3"
                        >
                            <span className="w-20 shrink-0 text-sm text-muted-foreground sm:w-24">
                                {row.label}
                            </span>
                            <span
                                className={cn(
                                    "flex-1 text-sm wrap-break-word",
                                    row.value
                                        ? "font-medium"
                                        : "italic text-muted-foreground"
                                )}
                            >
                                {row.value ?? "Niet opgegeven"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}