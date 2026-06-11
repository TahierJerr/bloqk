"use client";

import { Upload, X } from "lucide-react";

export function LogoStep({
    logo,
    onPick,
    onRemove,
}: {
    logo: string | null;
    onPick: () => void;
    onRemove: () => void;
}) {
    return (
        <div className="flex flex-col items-start gap-4">
            {logo ? (
                <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={logo}
                        alt="Je logo"
                        className="max-h-40 rounded-2xl border bg-card object-contain p-4"
                    />
                    <button
                        type="button"
                        onClick={onRemove}
                        aria-label="Logo verwijderen"
                        className="absolute -right-2 -top-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-110"
                    >
                        <X className="size-3.5" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={onPick}
                    className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed py-12 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                    <Upload className="size-6" />
                    <span className="text-sm font-medium">
                        Klik om je logo te uploaden
                    </span>
                    <span className="text-xs">PNG of JPG</span>
                </button>
            )}
            <p className="text-xs text-muted-foreground">
                Geen logo? Geen probleem, sla deze stap over en wij maken een
                nette tekstvariant.
            </p>
        </div>
    );
}
