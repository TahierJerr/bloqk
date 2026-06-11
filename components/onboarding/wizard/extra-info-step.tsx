"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { WizardFormValues } from "./wizard-config";

export function ExtraInfoStep({
    register,
    errors,
}: {
    register: UseFormRegister<WizardFormValues>;
    errors: FieldErrors<WizardFormValues>;
}) {
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
}
