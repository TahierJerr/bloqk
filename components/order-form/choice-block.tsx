"use client";

import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ChoiceBlockProps = {
    icon: LucideIcon;
    label: string;
    description?: string;
    selected: boolean;
    onSelect: () => void;
};

export function ChoiceBlock({
    icon: Icon,
    label,
    description,
    selected,
    onSelect,
}: ChoiceBlockProps) {
    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={cn(
                "group relative flex min-h-24 w-full cursor-pointer flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition-all duration-200 sm:min-h-30 sm:gap-2.5",
                "hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                selected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/40"
            )}
        >
            <span
                className={cn(
                    "flex size-8 items-center justify-center rounded-lg transition-colors sm:size-10",
                    selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:text-foreground"
                )}
            >
                <Icon className="size-4 sm:size-5" />
            </span>

            <span className="flex flex-col gap-0.5 mt-1 sm:mt-0">
                <span className="text-sm font-semibold leading-snug">{label}</span>
                {description ? (
                    <span className="text-xs leading-normal text-muted-foreground">
                        {description}
                    </span>
                ) : null}
            </span>

            <span
                className={cn(
                    "absolute right-3 top-3 flex size-5 items-center justify-center rounded-full transition-transform duration-200 sm:right-4 sm:top-4",
                    selected
                        ? "scale-100 bg-primary text-primary-foreground"
                        : "scale-0"
                )}
                aria-hidden
            >
                <Check className="size-3" strokeWidth={3} />
            </span>
        </button>
    );
}