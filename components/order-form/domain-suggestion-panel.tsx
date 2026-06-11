"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DomainSuggestion } from "@/lib/domains";

/**
 * Het suggestiepaneel op de domeinstap: maximaal 9 klikbare
 * domeinnaam-blokken (vrij bevestigde eerst), met overslaan als
 * volwaardige optie.
 */
export function DomainSuggestionPanel({
    salonName,
    suggestions,
    loading,
    selected,
    onSelect,
}: {
    salonName: string;
    suggestions: DomainSuggestion[];
    loading: boolean;
    selected: string;
    onSelect: (domain: string) => void;
}) {
    return (
        <div className="flex flex-col gap-3 pt-2">
            <p className="text-sm font-medium">
                Kies alvast een domeinnaam{" "}
                <span className="font-normal text-muted-foreground">(optioneel)</span>
            </p>

            {salonName.length < 2 ? (
                <p className="text-sm text-muted-foreground">
                    Vul eerst de naam van je salon in, dan doen wij een paar
                    suggesties.
                </p>
            ) : loading ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Beschikbare domeinen zoeken...
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-3">
                    {suggestions.map((suggestion) => {
                        const isSelected = selected === suggestion.domain;
                        return (
                            <button
                                key={suggestion.domain}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => onSelect(isSelected ? "" : suggestion.domain)}
                                className={cn(
                                    "flex flex-col items-start gap-1 rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-200 cursor-pointer",
                                    "hover:-translate-y-0.5 hover:shadow-sm motion-reduce:transform-none",
                                    isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-border bg-card hover:border-primary/40"
                                )}
                            >
                                <span className="w-full truncate text-sm font-medium">
                                    {suggestion.domain}
                                </span>
                                <span
                                    className={cn(
                                        "text-xs",
                                        suggestion.status === "free"
                                            ? "font-medium text-emerald-600"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {suggestion.status === "free"
                                        ? "✓ beschikbaar"
                                        : "beschikbaarheid onbekend"}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                Twijfel je of staat je favoriet er niet tussen? Sla deze stap
                gerust over, kiezen kan later ook.
            </p>
        </div>
    );
}
