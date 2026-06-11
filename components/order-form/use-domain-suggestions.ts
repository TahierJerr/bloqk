"use client";

import { useEffect, useRef, useState } from "react";
import type { DomainSuggestion } from "@/lib/domains";

/**
 * Haalt domeinsuggesties (TransIP) op zodra de klant op de domeinstap
 * kiest voor "nog geen domein". Cachet per salonnaam, zodat heen-en-weer
 * navigeren geen onnodige API-calls oplevert.
 */
export function useDomainSuggestions({
    enabled,
    salonName,
}: {
    enabled: boolean;
    salonName: string;
}) {
    const [result, setResult] = useState<{
        forName: string;
        items: DomainSuggestion[];
    } | null>(null);
    // Voorkomt dubbele fetches zonder extra renders
    const inFlight = useRef<string | null>(null);

    // 'Laden' is afgeleide staat: er is een naam waarvoor nog geen
    // resultaat binnen is
    const needsFetch =
        enabled && salonName.length >= 2 && result?.forName !== salonName;

    useEffect(() => {
        if (!needsFetch || inFlight.current === salonName) return;
        inFlight.current = salonName;

        let cancelled = false;
        fetch("/api/domains/suggest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ salonName }),
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data: { suggestions?: DomainSuggestion[] } | null) => {
                if (cancelled) return;
                setResult({ forName: salonName, items: data?.suggestions ?? [] });
            })
            .catch(() => {
                if (cancelled) return;
                setResult({ forName: salonName, items: [] });
            })
            .finally(() => {
                if (inFlight.current === salonName) inFlight.current = null;
            });

        return () => {
            cancelled = true;
        };
    }, [needsFetch, salonName]);

    return {
        suggestions: result?.forName === salonName ? result.items : [],
        loading: needsFetch,
    };
}
