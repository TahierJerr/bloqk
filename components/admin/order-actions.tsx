"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Globe, Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import type { OrderStatus } from "@/prisma/generated/prisma/client";

const previewSchema = z.object({
    previewUrl: z.url("Vul een geldige link in (incl. https://)"),
});

type PreviewValues = z.infer<typeof previewSchema>;

export function OrderActions({
    orderId,
    status,
    previewUrl,
}: {
    orderId: string;
    status: OrderStatus;
    previewUrl: string | null;
}) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError: setFormError,
    } = useForm<PreviewValues>({
        resolver: zodResolver(previewSchema),
        defaultValues: { previewUrl: previewUrl ?? "" },
    });

    async function patch(body: Record<string, string>) {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error(
                typeof data?.error === "string" ? data.error : "Er ging iets mis"
            );
        }
        router.refresh();
    }

    async function sendPreview(values: PreviewValues) {
        try {
            await patch({ action: "preview_ready", previewUrl: values.previewUrl });
        } catch (err) {
            setFormError("root", { message: (err as Error).message });
        }
    }

    async function activate() {
        setBusy(true);
        setError(null);
        try {
            await patch({ action: "activate" });
        } catch (err) {
            setError((err as Error).message);
            setBusy(false);
        }
    }

    if (status === "PENDING" || status === "PREVIEW_SENT") {
        return (
            <form
                onSubmit={handleSubmit(sendPreview)}
                className="flex flex-col gap-3"
            >
                <Field data-invalid={!!errors.previewUrl}>
                    <FieldLabel htmlFor="previewUrl">
                        {status === "PREVIEW_SENT"
                            ? "Previewlink aanpassen"
                            : "Link naar de gebouwde website"}
                    </FieldLabel>
                    <Input
                        id="previewUrl"
                        type="url"
                        placeholder="https://preview.bloqk.nl/salon"
                        aria-invalid={!!errors.previewUrl}
                        {...register("previewUrl")}
                    />
                    <FieldError errors={[errors.previewUrl]} />
                </Field>
                {errors.root && (
                    <p className="text-sm font-medium text-destructive">
                        {errors.root.message}
                    </p>
                )}
                <Button type="submit" disabled={isSubmitting} className="cursor-pointer self-start">
                    {isSubmitting ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                        <Globe className="mr-2 size-4" />
                    )}
                    {status === "PREVIEW_SENT"
                        ? "Previewlink bijwerken"
                        : "Website is klaar — stuur preview"}
                </Button>
                <p className="text-xs text-muted-foreground">
                    De klant ziet de previewlink direct in z&apos;n voortgangsoverzicht
                    en kan goedkeuren of feedback geven.
                </p>
            </form>
        );
    }

    if (status === "PAID") {
        return (
            <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                    De betaling is binnen. Staat de site live? Dan ontgrendelt deze
                    knop het dashboard voor de klant.
                </p>
                {error && (
                    <p className="text-sm font-medium text-destructive">{error}</p>
                )}
                <Button onClick={activate} disabled={busy} className="cursor-pointer self-start">
                    {busy ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                        <Rocket className="mr-2 size-4" />
                    )}
                    Zet salon live
                </Button>
            </div>
        );
    }

    if (status === "APPROVED") {
        return (
            <p className="text-sm text-muted-foreground">
                De klant heeft de preview goedgekeurd; we wachten op de betaling.
            </p>
        );
    }

    if (status === "ACTIVE") {
        return (
            <p className="text-sm font-medium text-emerald-700">
                Deze salon is live. 🎉
            </p>
        );
    }

    return (
        <p className="text-sm text-muted-foreground">
            Deze aanvraag is geannuleerd.
        </p>
    );
}
