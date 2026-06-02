"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClockIcon, UserIcon, ScissorsIcon } from "lucide-react";

type Appointment = {
    id: string;
    clientName: string;
    serviceName: string;
    staffName: string;
    startTime: string; // "09:00"
    endTime: string;   // "10:00"
    status: "CONFIRMED" | "PENDING" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
};

type AppointmentsTodayProps = {
    appointments: Appointment[];
};

const statusConfig: Record<Appointment["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    CONFIRMED: { label: "Confirmed", variant: "default" },
    PENDING: { label: "Pending", variant: "secondary" },
    CANCELLED: { label: "Cancelled", variant: "destructive" },
    COMPLETED: { label: "Completed", variant: "outline" },
    NO_SHOW: { label: "No show", variant: "destructive" },
};

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function AppointmentsToday({ appointments }: AppointmentsTodayProps) {
    const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

    const filtered = appointments.filter((apt) => {
        // In real usage startTime would be a full DateTime — for now filter by selected date
        // When connected to Prisma, pass full Date objects and filter here
        return true; // placeholder — replace with date comparison
    });

    return (
        <div className="flex flex-col gap-4 px-4 lg:px-6 lg:flex-row">
            <Card className="shrink-0">
                <CardContent className="p-3">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        className="rounded-md"
                    />
                </CardContent>
            </Card>

            <Card className="flex-1">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">
                        {isSameDay(selectedDate, new Date())
                            ? "Today"
                            : selectedDate.toLocaleDateString("en-GB", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                            })}
                        <span className="ml-2 text-muted-foreground font-normal text-sm">
                            {filtered.length} appointment{filtered.length !== 1 ? "s" : ""}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    {filtered.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No appointments this day.</p>
                    ) : (
                        filtered.map((apt) => (
                            <div
                                key={apt.id}
                                className="flex items-start justify-between gap-4 rounded-lg border p-3"
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <UserIcon className="size-3.5 text-muted-foreground" />
                                        {apt.clientName}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <ScissorsIcon className="size-3.5" />
                                        {apt.serviceName}
                                        <span className="text-muted-foreground/60">·</span>
                                        {apt.staffName}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <ClockIcon className="size-3" />
                                        {apt.startTime} – {apt.endTime}
                                    </div>
                                </div>
                                <Badge variant={statusConfig[apt.status].variant}>
                                    {statusConfig[apt.status].label}
                                </Badge>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
