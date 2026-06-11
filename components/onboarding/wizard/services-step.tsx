"use client";

import {
    useFieldArray,
    type Control,
    type FieldErrors,
    type UseFormRegister,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import type { WizardFormValues } from "./wizard-config";

export function ServicesStep({
    control,
    register,
    errors,
}: {
    control: Control<WizardFormValues>;
    register: UseFormRegister<WizardFormValues>;
    errors: FieldErrors<WizardFormValues>;
}) {
    const serviceArray = useFieldArray({ control, name: "services" });

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
}
