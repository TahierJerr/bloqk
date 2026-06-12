"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  PartyPopper,
  Globe,
  Link as LinkIcon,
} from "lucide-react";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  orderSchema,
  SALON_TYPES,
  type Billing,
  type OrderFormValues,
  type Package,
  type SalonType,
} from "@/lib/order-schema";
import type { Pricing } from "@/lib/pricing";
import { ChoiceBlock } from "@/components/order-form/choice-block";
import { AddressAutocomplete } from "@/components/order-form/address-autocomplete";
import { ProgressBlocks } from "@/components/order-form/progress-blocks";
import { DomainSuggestionPanel } from "@/components/order-form/domain-suggestion-panel";
import { SummaryStep } from "@/components/order-form/summary-step";
import { useDomainSuggestions } from "@/components/order-form/use-domain-suggestions";
import {
  getBillingOptions,
  getPackageOptions,
  SALON_TYPE_ICONS,
  STEP_FIELDS,
  STEP_META,
  SUMMARY_STEP,
  TOTAL_STEPS,
} from "@/components/order-form/order-form-config";
import { OnboardingSignUpForm } from "../auth/onboarding-sign-up-form";
import { authClient } from "@/lib/auth-client";

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

  // Domeinsuggesties (TransIP) voor wie nog geen domein heeft
  const domainSuggestions = useDomainSuggestions({
    enabled: step === 2 && values.hasDomain === "no",
    salonName: salonNameValue,
  });

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
        "Er ging iets mis bij het versturen. Probeer het opnieuw.",
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
        <h2 className="text-3xl font-semibold tracking-tight">
          Aanvraag succesvol!
        </h2>
        <p className="mt-3 max-w-sm text-muted-foreground">
          Je workspace wordt voorbereid. We sturen je direct door naar je nieuwe
          dashboard...
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
            <p className="w-full text-sm text-destructive">{submitError}</p>
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
            ) : (
              <div />
            )}

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
              <FieldLabel htmlFor="salonName">Naam van je salon</FieldLabel>
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
              <p className="text-sm text-destructive">
                {errors.hasDomain.message}
              </p>
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
                  <DomainSuggestionPanel
                    salonName={salonNameValue}
                    suggestions={domainSuggestions.suggestions}
                    loading={domainSuggestions.loading}
                    selected={values.newDomain ?? ""}
                    onSelect={(domain) =>
                      setValue("newDomain", domain, {
                        shouldValidate: true,
                      })
                    }
                  />
                  <FieldError errors={[errors.newDomain]} />
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
                      <FieldLabel htmlFor="customDomain">
                        Wat is je domeinnaam?
                      </FieldLabel>
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
              0% commissie op boekingen, elke euro die je klanten betalen is
              voor jou.
            </p>
            {errors.billing ? (
              <p className="text-sm text-destructive">
                {errors.billing.message}
              </p>
            ) : null}
          </div>
        );

      case SUMMARY_STEP:
        return (
          <SummaryStep
            values={values}
            onEdit={editFromSummary}
            session={session!}
          />
        );

      default:
        return null;
    }
  }
}
