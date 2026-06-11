"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLOR_PALETTES } from "@/lib/intake-schema";

const CUSTOM_FIELDS = [
    ["primaryColor", "Hoofdkleur"],
    ["secondaryColor", "Tweede kleur"],
    ["accentColor", "Achtergrond"],
] as const;

export type CustomColorField = (typeof CUSTOM_FIELDS)[number][0];

export function ColorsStep({
    palette,
    colors,
    error,
    onSelectPalette,
    onSelectCustom,
    onChangeColor,
}: {
    palette: string;
    colors: Record<CustomColorField, string>;
    error?: string | undefined;
    onSelectPalette: (id: string) => void;
    onSelectCustom: () => void;
    onChangeColor: (field: CustomColorField, value: string) => void;
}) {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {COLOR_PALETTES.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onSelectPalette(option.id)}
                        aria-pressed={palette === option.id}
                        className={cn(
                            "group relative flex cursor-pointer flex-col items-start gap-2.5 rounded-xl border-2 p-3 text-left transition-all duration-200",
                            "hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none",
                            palette === option.id
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border bg-card hover:border-primary/40"
                        )}
                    >
                        <span className="flex gap-1.5">
                            {[option.primary, option.secondary, option.accent].map(
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
                            {option.name}
                        </span>
                        {palette === option.id && (
                            <span className="absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Check className="size-3" strokeWidth={3} />
                            </span>
                        )}
                    </button>
                ))}

                {/* Eigen kleuren */}
                <button
                    type="button"
                    onClick={onSelectCustom}
                    aria-pressed={palette === "custom"}
                    className={cn(
                        "group relative flex cursor-pointer flex-col items-start gap-2.5 rounded-xl border-2 p-3 text-left transition-all duration-200",
                        "hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none",
                        palette === "custom"
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
                    {palette === "custom" && (
                        <span className="absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-3" strokeWidth={3} />
                        </span>
                    )}
                </button>
            </div>

            {palette === "custom" && (
                <div className="grid grid-cols-3 gap-3 rounded-2xl border bg-card p-4">
                    {CUSTOM_FIELDS.map(([field, label]) => (
                        <label key={field} className="flex cursor-pointer flex-col items-center gap-2">
                            <input
                                type="color"
                                value={colors[field]}
                                onChange={(event) => onChangeColor(field, event.target.value)}
                                className="size-12 cursor-pointer rounded-lg border bg-transparent p-1"
                            />
                            <span className="text-xs font-medium text-muted-foreground">
                                {label}
                            </span>
                        </label>
                    ))}
                </div>
            )}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}
