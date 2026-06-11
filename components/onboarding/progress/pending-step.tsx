"use client";

import { ClipboardList, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChoiceBlock } from "@/components/order-form/choice-block";
import {
    CONTACT_METHODS,
    CONTACT_METHOD_LABELS,
    type ContactMethod,
} from "@/lib/intake-schema";
import { CONTACT_METHOD_ICONS, type OrderProgressInfo } from "./progress-config";

/**
 * Inhoud van de PENDING-stap: de intakekeuze (wizard of overleggen),
 * de contactmethode-picker, of de wachtstand wanneer de intake al
 * gedaan is.
 */
export function PendingStep({
    order,
    intakeMode,
    contactMethod,
    busy,
    onChooseWizard,
    onChooseContact,
    onBackToChoice,
    onSelectMethod,
    onRequestContact,
}: {
    order: OrderProgressInfo;
    intakeMode: "choice" | "contact";
    contactMethod: ContactMethod | null;
    busy: boolean;
    onChooseWizard: () => void;
    onChooseContact: () => void;
    onBackToChoice: () => void;
    onSelectMethod: (method: ContactMethod) => void;
    onRequestContact: () => void;
}) {
    if (order.intakeChoice === "wizard") {
        return (
            <p className="text-sm leading-relaxed text-muted-foreground">
                Bedankt voor het invullen! We bouwen nu je pagina en sturen je
                binnen 48 uur een preview ter goedkeuring.
            </p>
        );
    }

    if (order.intakeChoice === "call") {
        return (
            <p className="text-sm leading-relaxed text-muted-foreground">
                We nemen binnen 24 uur contact met je op
                {order.contactMethod
                    ? ` (${CONTACT_METHOD_LABELS[
                          order.contactMethod as ContactMethod
                      ]?.toLowerCase() ?? order.contactMethod})`
                    : ""}{" "}
                om alles door te nemen. Daarna gaan we direct voor je aan de
                slag.
            </p>
        );
    }

    if (intakeMode === "contact") {
        return (
            <div className="flex flex-col gap-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Goed plan! Hoe mogen we contact met je opnemen?
                </p>
                <div className="flex flex-col gap-2.5">
                    {CONTACT_METHODS.map((method) => (
                        <ChoiceBlock
                            key={method}
                            icon={CONTACT_METHOD_ICONS[method]}
                            label={CONTACT_METHOD_LABELS[method]}
                            selected={contactMethod === method}
                            onSelect={() => onSelectMethod(method)}
                        />
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={onRequestContact}
                        disabled={busy}
                        className="cursor-pointer"
                    >
                        {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                        Vraag contact aan
                    </Button>
                    <Button
                        variant="ghost"
                        disabled={busy}
                        onClick={onBackToChoice}
                        className="cursor-pointer text-muted-foreground"
                    >
                        Terug
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
                Je aanvraag is binnen! Hoe wil je de informatie voor je pagina
                aanleveren?
            </p>
            <div className="flex flex-col gap-2.5">
                <ChoiceBlock
                    icon={ClipboardList}
                    label="Zelf invullen"
                    description="Doorloop een korte wizard: logo, foto's, kleuren, openingstijden en diensten. Duurt ±5 minuten."
                    selected={false}
                    onSelect={onChooseWizard}
                />
                <ChoiceBlock
                    icon={MessageCircle}
                    label="Liever overleggen"
                    description="We nemen binnen 24 uur contact met je op en nemen alles samen door."
                    selected={false}
                    onSelect={onChooseContact}
                />
            </div>
        </div>
    );
}
