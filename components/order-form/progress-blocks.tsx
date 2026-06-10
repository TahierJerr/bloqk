"use client";

import { cn } from "@/lib/utils";
import { Logo } from "../logo";

type ProgressBlocksProps = {
    current: number;
    total: number;
};

export function ProgressBlocks({ current, total }: ProgressBlocksProps) {
    return (
        <>
        <div className="flex flex-col items-center gap-3 text-center">
            <Logo size="lg"/>
            <h1 className="max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
                Zet je salon online in een paar minuten
            </h1>
            <p className="max-w-md text-sm text-muted-foreground sm:text-base">
                Vertel ons iets over je salon, dan regelen wij de rest.
            </p>
        </div>
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>
                    Stap {Math.min(current + 1, total)} van {total}
                </span>
            </div>
            <div className="flex gap-1.5">
                {Array.from({ length: total }).map((_, index) => (
                    <div
                        key={index}
                        className="h-2 flex-1 overflow-hidden rounded-sm bg-muted"
                    >
                        <div
                            className={cn(
                                "h-full rounded-sm bg-primary transition-all duration-500 ease-out motion-reduce:transition-none",
                                index <= current ? "w-full" : "w-0"
                            )}
                        />
                    </div>
                ))}
            </div>
        </div>
        </>
    );
}
