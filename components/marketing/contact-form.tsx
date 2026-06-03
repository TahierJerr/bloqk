"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const contactSchema = z.object({
  salon: z.string().min(1, "Vul de naam van je salon in"),
  name: z.string().min(1, "Vul je naam in"),
  email: z.email("Vul een geldig e-mailadres in"),
  phone: z.string().min(1, "Vul je telefoonnummer in"),
  interest: z.enum(["abonnement", "eenmalig", "weet-ik-nog-niet"]),
  message: z.string().min(1, "Schrijf een kort bericht"),
});

type ContactValues = z.infer<typeof contactSchema>;

const interestOptions: { value: ContactValues["interest"]; label: string }[] = [
  { value: "abonnement", label: "Abonnement" },
  { value: "eenmalig", label: "Eenmalig" },
  { value: "weet-ik-nog-niet", label: "Weet ik nog niet" },
];

export function ContactForm() {
  const [sent, setSent] = React.useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      salon: "",
      name: "",
      email: "",
      phone: "",
      interest: "weet-ik-nog-niet",
      message: "",
    },
  });

  function onSubmit() {
    // Geen verzendlogica,  dit is alleen de UI.
    setSent(true);
    reset();
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-border bg-secondary/40 px-6 py-10 text-center">
        <h2 className="text-xl font-bold tracking-tight">Bericht ontvangen.</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Bedankt. We reageren binnen 1 werkdag. Geen sales druk, beloofd.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-6"
          onClick={() => setSent(false)}
        >
          Nog een bericht sturen
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <FieldGroup>
        <Field data-invalid={!!errors.salon}>
          <FieldLabel htmlFor="salon">Naam salon</FieldLabel>
          <Input
            id="salon"
            placeholder="Kapsalon de Knip"
            aria-invalid={!!errors.salon}
            {...register("salon")}
          />
          <FieldError errors={[errors.salon]} />
        </Field>

        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Jouw naam</FieldLabel>
          <Input
            id="name"
            placeholder="Voor- en achternaam"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="jij@salon.nl"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="phone">Telefoonnummer</FieldLabel>
          <Input
            id="phone"
            type="tel"
            placeholder="06 12 34 56 78"
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          <FieldError errors={[errors.phone]} />
        </Field>

        <Field data-invalid={!!errors.interest}>
          <span className="text-sm leading-snug font-medium select-none">
            Interesse
          </span>
          <Controller
            control={control}
            name="interest"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="gap-2.5"
              >
                {interestOptions.map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`interest-${option.value}`}
                    className="flex cursor-pointer items-center gap-3 rounded-3xl border border-border bg-background px-4 py-3 text-sm transition-colors select-none hover:bg-secondary/50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`interest-${option.value}`}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </RadioGroup>
            )}
          />
          <FieldError errors={[errors.interest]} />
        </Field>

        <Field data-invalid={!!errors.message}>
          <FieldLabel htmlFor="message">Bericht</FieldLabel>
          <Textarea
            id="message"
            rows={5}
            placeholder="Vertel kort wat je zoekt of waar je tegenaan loopt."
            aria-invalid={!!errors.message}
            {...register("message")}
          />
          <FieldError errors={[errors.message]} />
        </Field>
      </FieldGroup>

      <div>
        <Button
          type="button"
          size="lg"
          disabled={isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          Stuur bericht
        </Button>
      </div>
    </div>
  );
}
