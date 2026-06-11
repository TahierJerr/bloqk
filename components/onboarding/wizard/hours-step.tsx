"use client";

import { Controller, type Control, type UseFormRegister } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DAY_NAMES } from "@/lib/intake-schema";
import type { WizardFormValues } from "./wizard-config";

export function HoursStep({
    control,
    register,
    openingHours,
}: {
    control: Control<WizardFormValues>;
    register: UseFormRegister<WizardFormValues>;
    openingHours: { closed: boolean }[];
}) {
    return (
        <div className="flex flex-col divide-y overflow-hidden rounded-2xl border bg-card">
            {DAY_NAMES.map((day, index) => {
                const closed = openingHours[index]?.closed;
                return (
                    <div
                        key={day}
                        className="flex flex-wrap items-center gap-3 px-4 py-3"
                    >
                        <Controller
                            control={control}
                            name={`openingHours.${index}.closed`}
                            render={({ field }) => (
                                <label className="flex w-32 cursor-pointer items-center gap-2.5 select-none">
                                    <Checkbox
                                        checked={!field.value}
                                        onCheckedChange={(checked) =>
                                            field.onChange(checked !== true)
                                        }
                                    />
                                    <span
                                        className={cn(
                                            "text-sm font-medium",
                                            closed && "text-muted-foreground"
                                        )}
                                    >
                                        {day}
                                    </span>
                                </label>
                            )}
                        />
                        {closed ? (
                            <span className="text-sm text-muted-foreground">Gesloten</span>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Input
                                    type="time"
                                    className="w-28"
                                    aria-label={`${day} openingstijd`}
                                    {...register(`openingHours.${index}.open`)}
                                />
                                <span className="text-sm text-muted-foreground">tot</span>
                                <Input
                                    type="time"
                                    className="w-28"
                                    aria-label={`${day} sluitingstijd`}
                                    {...register(`openingHours.${index}.close`)}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
