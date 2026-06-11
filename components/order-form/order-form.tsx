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
    BadgePercent,
    CalendarClock,
    Flower2,
    Gem,
    Hammer,
    Hand,
    Loader2,
    PartyPopper,
    Pencil,
    PenTool,
    Scissors,
    Sparkles,
    Wand2,
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
    type Billing,
    type OrderFormValues,
    type Package,
    type SalonType,
    BILLING_LABELS,
} from "@/lib/order-schema";
import {
    formatEuro,
    splitWebsiteMonthly,
    type Pricing,
} from "@/lib/pricing";
import { ChoiceBlock } from "@/components/order-form/choice-block";
import { AddressAutocomplete } from "@/components/order-form/address-autocomplete";
import { ProgressBlocks } from "@/components/order-form/progress-blocks";
import type { DomainSuggestion } from "@/lib/domains";
import { OnboardingSignUpForm } from "../auth/onboarding-sign-up-form";
import { authClient } from "@/lib/auth-client";

// 7 form steps (indices 0-6); the summary is the last one. The progress bar
// shows one extra step because the account step (auth) precedes the form.
const TOTAL_STEPS = 7;
const SUMMARY_STEP = 6;

const STEP_META: { title: string; subtitle: string }[] = [
    { title: "Wat voor salon heb je?", subtitle: "Kies wat het beste past." },
    { title: "Hoe heet je salon?", subtitle: "Zo verschijnt je naam straks in Bloqk." },
    { title: "Heb je al een website?", subtitle: "Koppel je eigen domein of claim een nieuwe." },
    { title: "Waar zit je salon?", subtitle: "We zoeken je adres op in de database." },
    { title: "Wie bouwt je website?", subtitle: "Wij bouwen hem voor je, of we maken iets volledig op maat." },
    { title: "Hoe wil je betalen?", subtitle: "Het abonnement regelt je dashboard en online boekingen." },
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

function getPackageOptions(pricing: Pricing): {
    value: Package;
    description: string;
    icon: LucideIcon;
}[] {
    return [
        {
            value: "Wij bouwen het",
            description: `Wij bouwen je complete salonwebsite, vanaf ${formatEuro(pricing.websiteBase)}.`,
            icon: Hammer,
        },
        {
            value: "Maatwerk",
            description: "Iets bijzonders in je hoofd? We maken een voorstel op maat.",
            icon: Wand2,
        },
    ];
}

function getBillingOptions(pricing: Pricing): {
    value: Billing;
    label: string;
    description: string;
    icon: LucideIcon;
}[] {
    const splitPerMonth = splitWebsiteMonthly(pricing) + pricing.subMonthly;
    return [
        {
            value: "monthly",
            label: "Maandelijks",
            description: `${formatEuro(splitPerMonth)}/mnd in jaar 1 (website gespreid + abonnement), daarna ${formatEuro(pricing.subMonthly)}/mnd.`,
            icon: CalendarClock,
        },
        {
            value: "yearly",
            label: "Jaarlijks — beste deal",
            description: `Website in één keer (${formatEuro(pricing.websiteUpfront)}) + ${formatEuro(pricing.subYearly)}/jaar. Dat zijn 2 maanden gratis.`,
            icon: BadgePercent,
        },
    ];
}

const STEP_FIELDS: Record<number, (keyof OrderFormValues)[]> = {
    0: ["salonType"],
    1: ["salonName"],
    2: ["hasDomain", "customDomain"],
    3: ["address"],
    4: ["package"],
    5: ["billing"],
};

export function OrderForm({ pricing }: { pricing: Pricing }) {
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
    // Domeinsuggesties (TransIP) voor wie nog geen domein heeft
    const [domainSuggestions, setDomainSuggestions] = useState<{
        forName: string;
        items: DomainSuggestion[];
    } | null>(null);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    const form = useForm<OrderFormValues>({
        resolver: zodResolver(orderSchema),
        mode: "onTouched",
        defaultValues: {
            salonName: "",
            address: "",
            newDomain: "",
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

    const salonNameValue = values.salonName?.trim() ?? "";
    const wantsNewDomain = values.hasDomain === "no";

    // Suggesties ophalen zodra 'nog geen domein' gekozen is op de domeinstap
    useEffect(() => {
        if (step !== 2 || !wantsNewDomain || salonNameValue.length < 2) return;
        if (loadingSuggestions || domainSuggestions?.forName === salonNameValue) return;

        let cancelled = false;
        setLoadingSuggestions(true);
        fetch("/api/domains/suggest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ salonName: salonNameValue }),
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data: { suggestions?: DomainSuggestion[] } | null) => {
                if (cancelled) return;
                setDomainSuggestions({
                    forName: salonNameValue,
                    items: data?.suggestions ?? [],
                });
            })
            .catch(() => {
                if (cancelled) return;
                setDomainSuggestions({ forName: salonNameValue, items: [] });
            })
            .finally(() => {
                if (!cancelled) setLoadingSuggestions(false);
            });

        return () => {
            cancelled = true;
        };
    }, [step, wantsNewDomain, salonNameValue, loadingSuggestions, domainSuggestions]);

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

    function selectBilling(value: Billing) {
        setValue("billing", value, { shouldValidate: true });
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
                                label="Nee, ik heb nog geen domein"
                                description="Kies hieronder alvast een domeinnaam, of beslis later."
                                selected={values.hasDomain === "no"}
                                onSelect={() => {
                                    setValue("hasDomain", "no", { shouldValidate: true });
                                    setValue("customDomain", "");
                                }}
                            />
                            <ChoiceBlock
                                icon={LinkIcon}
                                label="Ja, ik heb al een domein"
                                description="Koppel je bestaande website (bijv. salon.nl)."
                                selected={values.hasDomain === "yes"}
                                onSelect={() => {
                                    setValue("hasDomain", "yes", { shouldValidate: true });
                                    setValue("newDomain", "");
                                }}
                            />
                        </div>
                        {errors.hasDomain ? (
                            <p className="text-sm text-destructive">{errors.hasDomain.message}</p>
                        ) : null}

                        {/* Domeinsuggesties op basis van de salonnaam */}
                        <AnimatePresence>
                            {values.hasDomain === "no" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex flex-col gap-3 pt-2">
                                        <p className="text-sm font-medium">
                                            Kies alvast een domeinnaam{" "}
                                            <span className="font-normal text-muted-foreground">
                                                (optioneel)
                                            </span>
                                        </p>
                                        {salonNameValue.length < 2 ? (
                                            <p className="text-sm text-muted-foreground">
                                                Vul eerst de naam van je salon in, dan doen
                                                wij een paar suggesties.
                                            </p>
                                        ) : loadingSuggestions ? (
                                            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                                                <Loader2 className="size-4 animate-spin" />
                                                Beschikbare domeinen zoeken...
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-3">
                                                {(domainSuggestions?.items ?? []).map(
                                                    (suggestion) => {
                                                        const isSelected =
                                                            values.newDomain === suggestion.domain;
                                                        return (
                                                            <button
                                                                key={suggestion.domain}
                                                                type="button"
                                                                aria-pressed={isSelected}
                                                                onClick={() =>
                                                                    setValue(
                                                                        "newDomain",
                                                                        isSelected ? "" : suggestion.domain,
                                                                        { shouldValidate: true }
                                                                    )
                                                                }
                                                                className={cn(
                                                                    "flex flex-col items-start gap-1 rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-200 cursor-pointer",
                                                                    "hover:-translate-y-0.5 hover:shadow-sm motion-reduce:transform-none",
                                                                    isSelected
                                                                        ? "border-primary bg-primary/5"
                                                                        : "border-border bg-card hover:border-primary/40"
                                                                )}
                                                            >
                                                                <span className="w-full truncate text-sm font-medium">
                                                                    {suggestion.domain}
                                                                </span>
                                                                <span
                                                                    className={cn(
                                                                        "text-xs",
                                                                        suggestion.status === "free"
                                                                            ? "font-medium text-emerald-600"
                                                                            : "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {suggestion.status === "free"
                                                                        ? "✓ beschikbaar"
                                                                        : "beschikbaarheid onbekend"}
                                                                </span>
                                                            </button>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Twijfel je of staat je favoriet er niet tussen?
                                            Sla deze stap gerust over, kiezen kan later ook.
                                        </p>
                                        <FieldError errors={[errors.newDomain]} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

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
                            {getPackageOptions(pricing).map((option) => (
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

            case 5:
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            {getBillingOptions(pricing).map((option) => (
                                <ChoiceBlock
                                    key={option.value}
                                    icon={option.icon}
                                    label={option.label}
                                    description={option.description}
                                    selected={values.billing === option.value}
                                    onSelect={() => selectBilling(option.value)}
                                />
                            ))}
                        </div>
                        <p className="rounded-xl bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
                            0% commissie op boekingen — elke euro die je klanten
                            betalen is voor jou.
                        </p>
                        {errors.billing ? (
                            <p className="text-sm text-destructive">
                                {errors.billing.message}
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
                : values.hasDomain === "no"
                    ? values.newDomain
                        ? `${values.newDomain} (nieuw te registreren)`
                        : "Kiezen we later samen"
                    : null,
            step: 2,
        },
        { label: "Adres", value: values.address || null, step: 3 },
        { label: "Pakket", value: values.package ?? null, step: 4 },
        {
            label: "Betaling",
            value: values.billing ? BILLING_LABELS[values.billing] : null,
            step: 5,
        },
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