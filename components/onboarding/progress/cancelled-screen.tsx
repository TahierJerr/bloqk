"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export function CancelledScreen() {
    return (
        <main className="flex min-h-svh flex-col items-center justify-center px-6 py-16 text-center">
            <Logo size="lg" />
            <h1 className="mt-8 text-2xl font-semibold tracking-tight">
                Je aanvraag is geannuleerd
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Toch bedacht, of was het een vergissing? Stuur ons een berichtje
                en we pakken je aanvraag zo weer op.
            </p>
            <Button asChild variant="outline" className="mt-6">
                <a href="mailto:support@bloqk.nl">Mail support@bloqk.nl</a>
            </Button>
        </main>
    );
}
