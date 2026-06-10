"use client";

import { useRef, useState } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    ImagePlus,
    Loader2,
    PartyPopper,
    Plus,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { COLOR_PALETTES, DAY_NAMES } from "@/lib/intake-schema";

// ─── Formulier-schema (client) ───────────────────────────────────────────────
// Duur en prijs blijven strings in het formulier; conversie naar
// minuten/centen gebeurt bij het versturen

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Kies een geldige kleur");

const wizardFormSchema = z.object({
    logo: z.string().nullable(),
    photos: z.array(z.string()).max(6, "Maximaal 6 foto's"),
    palette: z.string().min(1, "Kies een kleurencombinatie"),
    primaryColor: hexColor,
    secondaryColor: hexColor,
    accentColor: hexColor,
    openingHours: z
        .array(
            z.object({
                closed: z.boolean(),
                open: z.string().regex(/^\d{2}:\d{2}$/, "Vul een tijd in"),
                close: z.string().regex(/^\d{2}:\d{2}$/, "Vul een tijd in"),
            })
        )
        .length(7),
    services: z
        .array(
            z.object({
                name: z.string().trim().min(1, "Vul een naam in"),
                duration: z
                    .string()
                    .regex(/^\d+$/, "Alleen hele minuten")
                    .refine((v) => parseInt(v) >= 5 && parseInt(v) <= 480, "Tussen 5 en 480 minuten"),
                price: z
                    .string()
                    .regex(/^\d+([.,]\d{1,2})?$/, "Bijv. 27,50"),
            })
        )
        .min(1, "Voeg minimaal één dienst toe"),
    extraInfo: z.string().max(2000, "Houd het wat korter").optional(),
});

type WizardFormValues = z.infer<typeof wizardFormSchema>;

const STEP_META: { title: string; subtitle: string }[] = [
    { title: "Heb je een logo?", subtitle: "Upload je logo, dan gebruiken we die op je pagina." },
    { title: "Foto's van je salon", subtitle: "Een paar mooie foto's maken je pagina persoonlijk." },
    { title: "Welke kleuren passen bij jouw salon?", subtitle: "Kies een combinatie of stel zelf iets samen." },
    { title: "Wat zijn je openingstijden?", subtitle: "Zet dagen aan of uit en vul je tijden in." },
    { title: "Welke diensten bied je aan?", subtitle: "Deze komen straks direct in je boekingssysteem." },
    { title: "Nog iets dat we moeten weten?", subtitle: "Wensen, stijl, dingen die je écht (niet) wilt." },
];

const TOTAL_STEPS = STEP_META.length;

// Velden die per stap gevalideerd worden
const STEP_FIELDS: Record<number, (keyof WizardFormValues)[]> = {
    0: ["logo"],
    1: ["photos"],
    2: ["palette", "primaryColor", "secondaryColor", "accentColor"],
    3: ["openingHours"],
    4: ["services"],
    5: ["extraInfo"],
};

// Verkleint een afbeelding client-side en geeft een data-URL terug;
// tijdelijke opslag in de database tot er objectopslag gekoppeld is
async function fileToDataUrl(file: File, maxDim: number): Promise<string> {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const isPng = file.type === "image/png";
    return canvas.toDataURL(isPng ? "image/png" : "image/jpeg", 0.82);
}

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
        defaultValues: {
            logo: null,
            photos: [],
            palette: "",
            primaryColor: "#2563eb",
            secondaryColor: "#0f172a",
            accentColor: "#eff6ff",
            openingHours: DAY_NAMES.map((_, index) => ({
                closed: index === 6, // zondag standaard dicht
                open: "09:00",
                close: "17:30",
            })),
            services: [{ name: "", duration: "30", price: "" }],
            extraInfo: "",
        },
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

    const serviceArray = useFieldArray({ control, name: "services" });

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
        const data = getValues();
        try {
            const res = await fetch("/api/order/intake", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    choice: "wizard",
                    logo: data.logo,
                    photos: data.photos,
                    colors: {
                        primary: data.primaryColor,
                        secondary: data.secondaryColor,
                        accent: data.accentColor,
                    },
                    openingHours: data.openingHours.map((hour, index) => ({
                        day: index,
                        closed: hour.closed,
                        open: hour.open,
                        close: hour.close,
                    })),
                    services: data.services.map((service) => ({
                        name: service.name.trim(),
                        duration: parseInt(service.duration),
                        price: Math.round(parseFloat(service.price.replace(",", ".")) * 100),
                    })),
                    extraInfo: data.extraInfo?.trim() || undefined,
                }),
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
                    <div className="flex flex-col items-start gap-4">
                        {values.logo ? (
                            <div className="relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={values.logo}
                                    alt="Je logo"
                                    className="max-h-40 rounded-2xl border bg-card object-contain p-4"
                                />
                                <button
                                    type="button"
                                    onClick={() => setValue("logo", null)}
                                    aria-label="Logo verwijderen"
                                    className="absolute -right-2 -top-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-110"
                                >
                                    <X className="size-3.5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => logoInputRef.current?.click()}
                                className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed py-12 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                            >
                                <Upload className="size-6" />
                                <span className="text-sm font-medium">
                                    Klik om je logo te uploaden
                                </span>
                                <span className="text-xs">PNG of JPG</span>
                            </button>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Geen logo? Geen probleem, sla deze stap over en wij maken een
                            nette tekstvariant.
                        </p>
                    </div>
                );

            case 1:
                return (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {values.photos.map((photo, index) => (
                                <div key={index} className="relative aspect-square">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={photo}
                                        alt={`Foto ${index + 1}`}
                                        className="size-full rounded-xl border object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setValue(
                                                "photos",
                                                values.photos.filter((_, i) => i !== index)
                                            )
                                        }
                                        aria-label="Foto verwijderen"
                                        className="absolute -right-2 -top-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-110"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                </div>
                            ))}
                            {values.photos.length < 6 && (
                                <button
                                    type="button"
                                    onClick={() => photoInputRef.current?.click()}
                                    className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                                >
                                    <ImagePlus className="size-6" />
                                    <span className="text-xs font-medium">Foto toevoegen</span>
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Maximaal 6 foto&apos;s. Denk aan je interieur, je werk en je team.
                        </p>
                    </div>
                );

            case 2:
                return (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {COLOR_PALETTES.map((palette) => (
                                <button
                                    key={palette.id}
                                    type="button"
                                    onClick={() => selectPalette(palette.id)}
                                    aria-pressed={values.palette === palette.id}
                                    className={cn(
                                        "group relative flex cursor-pointer flex-col items-start gap-2.5 rounded-xl border-2 p-3 text-left transition-all duration-200",
                                        "hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none",
                                        values.palette === palette.id
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-border bg-card hover:border-primary/40"
                                    )}
                                >
                                    <span className="flex gap-1.5">
                                        {[palette.primary, palette.secondary, palette.accent].map(
                                            (color) => (
                                                <span
                                                    key={color}
                                                    className="size-6 rounded-full border"
                                                    style={{ backgroundColor: color }}
                                                />
                                            )
                                        )}
                                    </span>
                                    <span className="text-xs font-semibold leading-snug">
                                        {palette.name}
                                    </span>
                                    {values.palette === palette.id && (
                                        <span className="absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            <Check className="size-3" strokeWidth={3} />
                                        </span>
                                    )}
                                </button>
                            ))}

                            {/* Eigen kleuren */}
                            <button
                                type="button"
                                onClick={() => setValue("palette", "custom", { shouldValidate: true })}
                                aria-pressed={values.palette === "custom"}
                                className={cn(
                                    "group relative flex cursor-pointer flex-col items-start gap-2.5 rounded-xl border-2 p-3 text-left transition-all duration-200",
                                    "hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none",
                                    values.palette === "custom"
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-border bg-card hover:border-primary/40"
                                )}
                            >
                                <span
                                    className="size-6 rounded-full border"
                                    style={{
                                        background:
                                            "conic-gradient(#ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7, #ef4444)",
                                    }}
                                />
                                <span className="text-xs font-semibold leading-snug">
                                    Eigen kleuren kiezen
                                </span>
                                {values.palette === "custom" && (
                                    <span className="absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <Check className="size-3" strokeWidth={3} />
                                    </span>
                                )}
                            </button>
                        </div>

                        {values.palette === "custom" && (
                            <div className="grid grid-cols-3 gap-3 rounded-2xl border bg-card p-4">
                                {(
                                    [
                                        ["primaryColor", "Hoofdkleur"],
                                        ["secondaryColor", "Tweede kleur"],
                                        ["accentColor", "Achtergrond"],
                                    ] as const
                                ).map(([field, label]) => (
                                    <label key={field} className="flex cursor-pointer flex-col items-center gap-2">
                                        <input
                                            type="color"
                                            value={values[field]}
                                            onChange={(event) =>
                                                setValue(field, event.target.value, { shouldValidate: true })
                                            }
                                            className="size-12 cursor-pointer rounded-lg border bg-transparent p-1"
                                        />
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {errors.palette ? (
                            <p className="text-sm text-destructive">{errors.palette.message}</p>
                        ) : null}
                    </div>
                );

            case 3:
                return (
                    <div className="flex flex-col divide-y overflow-hidden rounded-2xl border bg-card">
                        {DAY_NAMES.map((day, index) => {
                            const closed = values.openingHours[index]?.closed;
                            return (
                                <div
                                    key={day}
                                    className="flex flex-wrap items-center gap-3 px-4 py-3"
                                >
                                    <Controller
                                        control={control}
                                        name={`openingHours.${index}.closed`}
                                        render={({ field }) => (
                                            <label className="flex w-32 cursor-pointer items-center gap-2.5 select-none">
                                                <Checkbox
                                                    checked={!field.value}
                                                    onCheckedChange={(checked) =>
                                                        field.onChange(checked !== true)
                                                    }
                                                />
                                                <span
                                                    className={cn(
                                                        "text-sm font-medium",
                                                        closed && "text-muted-foreground"
                                                    )}
                                                >
                                                    {day}
                                                </span>
                                            </label>
                                        )}
                                    />
                                    {closed ? (
                                        <span className="text-sm text-muted-foreground">Gesloten</span>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="time"
                                                className="w-28"
                                                aria-label={`${day} openingstijd`}
                                                {...register(`openingHours.${index}.open`)}
                                            />
                                            <span className="text-sm text-muted-foreground">tot</span>
                                            <Input
                                                type="time"
                                                className="w-28"
                                                aria-label={`${day} sluitingstijd`}
                                                {...register(`openingHours.${index}.close`)}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );

            case 4:
                return (
                    <div className="flex flex-col gap-4">
                        {serviceArray.fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="flex flex-col gap-3 rounded-2xl border bg-card p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Dienst {index + 1}
                                    </span>
                                    {serviceArray.fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => serviceArray.remove(index)}
                                            aria-label="Dienst verwijderen"
                                            className="cursor-pointer text-muted-foreground transition-colors hover:text-destructive"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                </div>
                                <FieldGroup>
                                    <Field data-invalid={!!errors.services?.[index]?.name}>
                                        <FieldLabel htmlFor={`service-name-${index}`}>Naam</FieldLabel>
                                        <Input
                                            id={`service-name-${index}`}
                                            placeholder="Bijv. Knippen & föhnen"
                                            aria-invalid={!!errors.services?.[index]?.name}
                                            {...register(`services.${index}.name`)}
                                        />
                                        <FieldError errors={[errors.services?.[index]?.name]} />
                                    </Field>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field data-invalid={!!errors.services?.[index]?.duration}>
                                            <FieldLabel htmlFor={`service-duration-${index}`}>
                                                Duur (minuten)
                                            </FieldLabel>
                                            <Input
                                                id={`service-duration-${index}`}
                                                inputMode="numeric"
                                                placeholder="30"
                                                aria-invalid={!!errors.services?.[index]?.duration}
                                                {...register(`services.${index}.duration`)}
                                            />
                                            <FieldError errors={[errors.services?.[index]?.duration]} />
                                        </Field>
                                        <Field data-invalid={!!errors.services?.[index]?.price}>
                                            <FieldLabel htmlFor={`service-price-${index}`}>
                                                Prijs (€)
                                            </FieldLabel>
                                            <Input
                                                id={`service-price-${index}`}
                                                inputMode="decimal"
                                                placeholder="27,50"
                                                aria-invalid={!!errors.services?.[index]?.price}
                                                {...register(`services.${index}.price`)}
                                            />
                                            <FieldError errors={[errors.services?.[index]?.price]} />
                                        </Field>
                                    </div>
                                </FieldGroup>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                serviceArray.append({ name: "", duration: "30", price: "" })
                            }
                            className="cursor-pointer self-start"
                        >
                            <Plus className="mr-2 size-4" />
                            Nog een dienst toevoegen
                        </Button>

                        {errors.services?.root || errors.services?.message ? (
                            <p className="text-sm text-destructive">
                                {errors.services.root?.message ?? errors.services.message}
                            </p>
                        ) : null}
                    </div>
                );

            case 5:
                return (
                    <Field data-invalid={!!errors.extraInfo}>
                        <FieldLabel htmlFor="extraInfo">Extra info of wensen</FieldLabel>
                        <Textarea
                            id="extraInfo"
                            rows={6}
                            placeholder="Bijv. 'Ik wil graag een rustige, luxe uitstraling' of 'Mijn Instagram is @mijnsalon, gebruik die stijl.'"
                            aria-invalid={!!errors.extraInfo}
                            {...register("extraInfo")}
                        />
                        <FieldError errors={[errors.extraInfo]} />
                    </Field>
                );

            default:
                return null;
        }
    }
}
