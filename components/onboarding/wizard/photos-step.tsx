"use client";

import { ImagePlus, X } from "lucide-react";

export function PhotosStep({
    photos,
    onPick,
    onRemove,
}: {
    photos: string[];
    onPick: () => void;
    onRemove: (index: number) => void;
}) {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={photo}
                            alt={`Foto ${index + 1}`}
                            className="size-full rounded-xl border object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            aria-label="Foto verwijderen"
                            className="absolute -right-2 -top-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-110"
                        >
                            <X className="size-3.5" />
                        </button>
                    </div>
                ))}
                {photos.length < 6 && (
                    <button
                        type="button"
                        onClick={onPick}
                        className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                    >
                        <ImagePlus className="size-6" />
                        <span className="text-xs font-medium">Foto toevoegen</span>
                    </button>
                )}
            </div>
            <p className="text-xs text-muted-foreground">
                Maximaal 6 foto&apos;s. Denk aan je interieur, je werk en je team.
            </p>
        </div>
    );
}
