"use client";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TrendingUpIcon, TrendingDownIcon, CalendarIcon, UsersIcon, ClockIcon } from "lucide-react";

type SectionCardsProps = {
    appointmentsToday: number;
    pendingAppointments: number;
    nextAppointment: { clientName: string; time: string } | null;
    revenueThisWeek: number;
    revenueChangePercent: number;
    clientsThisWeek: number;
    newClientsThisWeek: number;
    noShowsThisMonth: number;
    noShowsLastMonth: number;
};

function formatEuro(cents: number) {
    return new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
    }).format(cents / 100);
}

export function SectionCards({
    appointmentsToday,
    pendingAppointments,
    nextAppointment,
    revenueThisWeek,
    revenueChangePercent,
    clientsThisWeek,
    newClientsThisWeek,
    noShowsThisMonth,
    noShowsLastMonth,
}: SectionCardsProps) {
    const revenueUp = revenueChangePercent >= 0;
    const noShowDiff = noShowsThisMonth - noShowsLastMonth;
    const noShowDown = noShowDiff <= 0;

    return (
        <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Appointments today</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {appointmentsToday}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <CalendarIcon />
                            {pendingAppointments} pending
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        {nextAppointment
                            ? `Next at ${nextAppointment.time} — ${nextAppointment.clientName}`
                            : "No more appointments today"}
                        <ClockIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        {pendingAppointments} appointment{pendingAppointments !== 1 ? "s" : ""} not yet confirmed
                    </div>
                </CardFooter>
            </Card>

            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Revenue this week</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {formatEuro(revenueThisWeek)}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            {revenueUp ? <TrendingUpIcon /> : <TrendingDownIcon />}
                            {revenueUp ? "+" : ""}{revenueChangePercent}%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        {revenueUp ? "Up" : "Down"} from last week
                        {revenueUp ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" />}
                    </div>
                    <div className="text-muted-foreground">
                        Based on completed appointments
                    </div>
                </CardFooter>
            </Card>

            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Clients this week</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {clientsThisWeek}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <UsersIcon />
                            {newClientsThisWeek} new
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        {newClientsThisWeek} new client{newClientsThisWeek !== 1 ? "s" : ""} this week
                        <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        {clientsThisWeek - newClientsThisWeek} returning clients
                    </div>
                </CardFooter>
            </Card>

            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>No-shows this month</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {noShowsThisMonth}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            {noShowDown ? <TrendingDownIcon /> : <TrendingUpIcon />}
                            {noShowDiff > 0 ? "+" : ""}{noShowDiff}
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        {noShowDown ? "Down" : "Up"} from last month
                        {noShowDown ? <TrendingDownIcon className="size-4" /> : <TrendingUpIcon className="size-4" />}
                    </div>
                    <div className="text-muted-foreground">
                        {noShowDown ? "Reminders are working" : "Consider sending more reminders"}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
