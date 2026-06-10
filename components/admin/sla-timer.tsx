"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function formatElapsed(ms: number) {
    const totalMinutes = Math.floor(ms / 60_000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    if (days > 0) return `${days} d ${hours} u`;
    if (hours > 0) return `${hours} u ${minutes} m`;
    return `${minutes} m`;
}

// Kleur op basis van hoe lang een aanvraag al ligt te wachten
// (<24u groen, <48u amber, daarna rood)
function elapsedColor(ms: number) {
    const hours = ms / 3_600_000;
    if (hours < 24) return "text-emerald-600";
    if (hours < 48) return "text-amber-600";
    return "text-red-600";
}

export function SlaTimer({
    since,
    active,
    className,
}: {
    since: string;
    // Tikt alleen zolang de bal bij ons ligt; anders statisch en gedempt
    active: boolean;
    className?: string;
}) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!active) return;
        const interval = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(interval);
    }, [active]);

    const elapsed = Math.max(0, now - new Date(since).getTime());

    return (
        <span
            className={cn(
                "font-medium tabular-nums",
                active ? elapsedColor(elapsed) : "text-muted-foreground",
                className
            )}
        >
            {formatElapsed(elapsed)}
        </span>
    );
}
