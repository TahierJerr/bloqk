"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { COLOR_PALETTES } from "@/lib/intake-schema";
import {
    buildIntakePayload,
    fileToDataUrl,
    STEP_FIELDS,
    STEP_META,
    TOTAL_STEPS,
    wizardDefaultValues,
    wizardFormSchema,
    type WizardFormValues,
} from "./wizard/wizard-config";
import { LogoStep } from "./wizard/logo-step";
import { PhotosStep } from "./wizard/photos-step";
import { ColorsStep, type CustomColorField } from "./wizard/colors-step";
import { HoursStep } from "./wizard/hours-step";
import { ServicesStep } from "./wizard/services-step";
import { ExtraInfoStep } from "./wizard/extra-info-step";

export function IntakeWizard({
    salonName,
    onCancel,
    onDone,
}: {
    salonName: string;
    onCancel: () => void;
    onDone: () => void;
}) {
    const shouldReduceMotion = useReducedMotion();
    const [[step, direction], setStep] = useState<[number, number]>([0, 0]);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [finished, setFinished] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<WizardFormValues>({
        resolver: zodResolver(wizardFormSchema),
        mode: "onTouched",
        defaultValues: wizardDefaultValues(),
    });

    const {
        register,
        control,
        setValue,
        trigger,
        getValues,
        watch,
        formState: { errors },
    } = form;

    // eslint-disable-next-line react-hooks/incompatible-library
    const values = watch();

    function paginate(target: number) {
        setStep([target, target > step ? 1 : -1]);
    }

    async function goNext() {
        const valid = await trigger(STEP_FIELDS[step]);
        if (!valid) return;
        if (step < TOTAL_STEPS - 1) {
            paginate(step + 1);
        } else {
            await submit();
        }
    }

    function goBack() {
        if (step > 0) paginate(step - 1);
        else onCancel();
    }

    async function submit() {
        setSubmitError(null);
        setSubmitting(true);
        try {
            const res = await fetch("/api/order/intake", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildIntakePayload(getValues())),
            });
            if (!res.ok) throw new Error();
            setFinished(true);
        } catch {
            setSubmitError("Er ging iets mis bij het versturen. Probeer het opnieuw.");
            setSubmitting(false);
        }
    }

    async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        try {
            setValue("logo", await fileToDataUrl(file, 600), { shouldValidate: true });
        } catch {
            setSubmitError("Dit bestand kunnen we niet lezen als afbeelding.");
        }
    }

    async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []);
        event.target.value = "";
        if (files.length === 0) return;
        const current = getValues("photos");
        const room = Math.max(0, 6 - current.length);
        try {
            const added = await Promise.all(
                files.slice(0, room).map((file) => fileToDataUrl(file, 1600))
            );
            setValue("photos", [...current, ...added], { shouldValidate: true });
        } catch {
            setSubmitError("Eén van de bestanden kunnen we niet lezen als afbeelding.");
        }
    }

    function selectPalette(id: string) {
        const palette = COLOR_PALETTES.find((p) => p.id === id);
        setValue("palette", id, { shouldValidate: true });
        if (palette) {
            setValue("primaryColor", palette.primary);
            setValue("secondaryColor", palette.secondary);
            setValue("accentColor", palette.accent);
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

    if (finished) {
        return (
            <main className="flex min-h-svh flex-col items-center justify-center px-6 py-16 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center"
                >
                    <div className="mb-6 rounded-full bg-primary/10 p-5">
                        <PartyPopper className="size-14 text-primary" />
                    </div>
                    <h2 className="text-3xl font-semibold tracking-tight">Klaar! 🚀</h2>
                    <p className="mt-3 max-w-sm text-muted-foreground">
                        We gaan aan de slag met {salonName}. Binnen 48 uur sturen we je
                        een preview ter goedkeuring.
                    </p>
                    <Button className="mt-8 cursor-pointer" onClick={onDone}>
                        Naar mijn overzicht
                    </Button>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col px-6 py-12">
            <div className="flex flex-col items-center gap-3 text-center">
                <Logo size="lg" />
                <h1 className="max-w-md text-2xl font-semibold tracking-tight">
                    Vertel ons over {salonName}
                </h1>
            </div>

            {/* Voortgang */}
            <div className="mt-6 flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                    Stap {step + 1} van {TOTAL_STEPS}
                </span>
                <div className="flex gap-1.5">
                    {STEP_META.map((_, index) => (
                        <div key={index} className="h-2 flex-1 overflow-hidden rounded-sm bg-muted">
                            <div
                                className={cn(
                                    "h-full rounded-sm bg-primary transition-all duration-500 ease-out motion-reduce:transition-none",
                                    index <= step ? "w-full" : "w-0"
                                )}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <motion.div
                key={`title-${step}`}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="mt-6 flex flex-col gap-1"
            >
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {STEP_META[step]?.title}
                </h2>
                <p className="text-sm text-muted-foreground">{STEP_META[step]?.subtitle}</p>
            </motion.div>

            <div className="mt-6 flex min-h-72 flex-1 flex-col">
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

            {submitError ? (
                <p className="mt-4 text-sm font-medium text-destructive">{submitError}</p>
            ) : null}

            <div className="mt-8 flex items-center justify-between gap-3">
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

                <div className="flex items-center gap-2">
                    {/* Logo en foto's zijn optioneel */}
                    {(step === 0 || step === 1) && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => paginate(step + 1)}
                            disabled={submitting}
                            className="cursor-pointer font-normal text-muted-foreground"
                        >
                            Overslaan
                        </Button>
                    )}
                    <Button
                        type="button"
                        onClick={goNext}
                        disabled={submitting}
                        className="cursor-pointer"
                    >
                        {step === TOTAL_STEPS - 1 ? (
                            submitting ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Versturen...
                                </>
                            ) : (
                                "Afronden"
                            )
                        ) : (
                            <>
                                Volgende
                                <ArrowRight className="ml-2 size-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Verborgen file inputs */}
            <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
            />
            <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
            />
        </main>
    );

    function renderStep() {
        switch (step) {
            case 0:
                return (
                    <LogoStep
                        logo={values.logo}
                        onPick={() => logoInputRef.current?.click()}
                        onRemove={() => setValue("logo", null)}
                    />
                );

            case 1:
                return (
                    <PhotosStep
                        photos={values.photos}
                        onPick={() => photoInputRef.current?.click()}
                        onRemove={(index) =>
                            setValue(
                                "photos",
                                values.photos.filter((_, i) => i !== index)
                            )
                        }
                    />
                );

            case 2:
                return (
                    <ColorsStep
                        palette={values.palette}
                        colors={{
                            primaryColor: values.primaryColor,
                            secondaryColor: values.secondaryColor,
                            accentColor: values.accentColor,
                        }}
                        error={errors.palette?.message}
                        onSelectPalette={selectPalette}
                        onSelectCustom={() =>
                            setValue("palette", "custom", { shouldValidate: true })
                        }
                        onChangeColor={(field: CustomColorField, value: string) =>
                            setValue(field, value, { shouldValidate: true })
                        }
                    />
                );

            case 3:
                return (
                    <HoursStep
                        control={control}
                        register={register}
                        openingHours={values.openingHours}
                    />
                );

            case 4:
                return (
                    <ServicesStep
                        control={control}
                        register={register}
                        errors={errors}
                    />
                );

            case 5:
                return <ExtraInfoStep register={register} errors={errors} />;

            default:
                return null;
        }
    }
}
