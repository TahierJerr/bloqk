import { cn } from "@/lib/utils";
import { DAY_NAMES } from "@/lib/intake-schema";
import type {
    OpeningHours,
    SalonSettings,
    Service,
} from "@/prisma/generated/prisma/client";
import { DetailSection } from "./detail-section";

/**
 * Alle gegevens uit de intake-wizard (branding, openingstijden,
 * diensten, extra wensen) zoals de admin ze op de orderdetailpagina
 * ziet.
 */
export function OrderWizardData({
    settings,
    services,
}: {
    settings: SalonSettings & { openingHours: OpeningHours[] };
    services: Service[];
}) {
    return (
        <>
            <DetailSection title="Branding (uit de wizard)">
                <div className="flex flex-col gap-5">
                    <div>
                        <p className="mb-2 text-xs text-muted-foreground">Logo</p>
                        {settings.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={settings.logoUrl}
                                alt="Logo van de salon"
                                className="max-h-32 rounded-xl border bg-background object-contain p-3"
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Geen logo geüpload — tekstvariant maken.
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="mb-2 text-xs text-muted-foreground">Kleuren</p>
                        <div className="flex gap-3">
                            {[
                                ["Hoofdkleur", settings.primaryColor],
                                ["Tweede kleur", settings.secondaryColor],
                                ["Achtergrond", settings.accentColor],
                            ].map(([label, color]) =>
                                color ? (
                                    <div key={label} className="flex flex-col items-center gap-1.5">
                                        <span
                                            className="size-10 rounded-full border"
                                            style={{ backgroundColor: color }}
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            {label}
                                        </span>
                                        <code className="text-[10px] text-muted-foreground">
                                            {color}
                                        </code>
                                    </div>
                                ) : null
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-xs text-muted-foreground">
                            Foto&apos;s ({settings.photoUrls.length})
                        </p>
                        {settings.photoUrls.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                                {settings.photoUrls.map((photo, index) => (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        key={index}
                                        src={photo}
                                        alt={`Salonfoto ${index + 1}`}
                                        className="aspect-square rounded-xl border object-cover"
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Geen foto&apos;s geüpload.
                            </p>
                        )}
                    </div>
                </div>
            </DetailSection>

            <DetailSection title="Openingstijden">
                <div className="divide-y text-sm">
                    {settings.openingHours.map((hour) => (
                        <div
                            key={hour.id}
                            className="flex items-center justify-between py-2"
                        >
                            <span className="font-medium">
                                {DAY_NAMES[hour.dayOfWeek] ?? `Dag ${hour.dayOfWeek}`}
                            </span>
                            <span
                                className={cn(
                                    hour.closed ? "text-muted-foreground" : "tabular-nums"
                                )}
                            >
                                {hour.closed ? "Gesloten" : `${hour.open} – ${hour.close}`}
                            </span>
                        </div>
                    ))}
                </div>
            </DetailSection>

            <DetailSection title={`Diensten (${services.length})`}>
                <div className="divide-y text-sm">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="flex items-center justify-between gap-3 py-2"
                        >
                            <span className="font-medium">{service.name}</span>
                            <span className="shrink-0 text-muted-foreground">
                                {service.duration} min · €
                                {(service.price / 100).toFixed(2).replace(".", ",")}
                            </span>
                        </div>
                    ))}
                </div>
            </DetailSection>

            {settings.extraInfo ? (
                <DetailSection title="Extra info / wensen">
                    <p className="whitespace-pre-wrap text-sm">{settings.extraInfo}</p>
                </DetailSection>
            ) : null}
        </>
    );
}
