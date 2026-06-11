import { Mail, Phone, Video } from "lucide-react";
import {
    CONTACT_METHOD_LABELS,
    type ContactMethod,
} from "@/lib/intake-schema";

const dateFormatter = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

/**
 * Opvallende banner op de orderdetailpagina wanneer de klant heeft
 * gevraagd om contact, met de gekozen methode en contactgegevens.
 */
export function ContactRequestBanner({
    contactMethod,
    customerName,
    customerEmail,
    customerPhone,
    requestedAt,
}: {
    contactMethod: string | null;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    requestedAt: Date | null;
}) {
    const icon =
        contactMethod === "phone" ? (
            <Phone className="size-5" />
        ) : contactMethod === "video" ? (
            <Video className="size-5" />
        ) : (
            <Mail className="size-5" />
        );

    return (
        <section className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    {icon}
                </span>
                <div className="flex flex-col gap-1">
                    <p className="font-semibold text-blue-900">
                        Deze klant wil dat je contact opneemt
                        {contactMethod
                            ? ` — ${CONTACT_METHOD_LABELS[
                                  contactMethod as ContactMethod
                              ]?.toLowerCase() ?? contactMethod}`
                            : ""}
                    </p>
                    <p className="text-sm text-blue-900/80">
                        {customerName} ·{" "}
                        <a className="underline" href={`mailto:${customerEmail}`}>
                            {customerEmail}
                        </a>
                        {customerPhone ? (
                            <>
                                {" "}·{" "}
                                <a className="underline" href={`tel:${customerPhone}`}>
                                    {customerPhone}
                                </a>
                            </>
                        ) : null}
                    </p>
                    {requestedAt ? (
                        <p className="text-xs text-blue-900/60">
                            Aangevraagd op {dateFormatter.format(requestedAt)} —
                            beloofd: reactie binnen 24 uur.
                        </p>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
