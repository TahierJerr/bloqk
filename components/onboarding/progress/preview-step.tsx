"use client";

import { ExternalLink, Loader2, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Inhoud van de PREVIEW_SENT-stap: previewlink bekijken, goedkeuren
 * of feedback geven.
 */
export function PreviewStep({
    previewUrl,
    busy,
    onApprove,
    onFeedback,
}: {
    previewUrl: string | null;
    busy: boolean;
    onApprove: () => void;
    onFeedback: () => void;
}) {
    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
                Je pagina staat klaar! Bekijk de preview en laat weten wat je
                ervan vindt.
            </p>
            <div className="flex flex-wrap gap-2">
                {previewUrl ? (
                    <Button asChild variant="outline" className="cursor-pointer">
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 size-4" />
                            Bekijk preview
                        </a>
                    </Button>
                ) : null}
                <Button onClick={onApprove} disabled={busy} className="cursor-pointer">
                    {busy ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                        <ThumbsUp className="mr-2 size-4" />
                    )}
                    Goedkeuren
                </Button>
                <Button
                    variant="ghost"
                    disabled={busy}
                    onClick={onFeedback}
                    className="cursor-pointer text-muted-foreground"
                >
                    Ik wil iets anders
                </Button>
            </div>
        </div>
    );
}
