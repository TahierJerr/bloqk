"use client";

import { useRouter } from "next/navigation";
import { ClipboardList, Inbox, Mail, Phone, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/prisma/generated/prisma/client";
import {
    SLA_ACTIVE_STATUSES,
    STATUS_LABELS,
    STATUS_STYLES,
} from "./order-status";
import { SlaTimer } from "./sla-timer";

export type AdminOrderRow = {
    id: string;
    salonName: string;
    salonType: string;
    package: string;
    status: OrderStatus;
    intakeChoice: string | null;
    contactMethod: string | null;
    userName: string;
    userEmail: string;
    userPhone: string | null;
    createdAt: string;
};

const dateFormatter = new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
});

function IntakeCell({ order }: { order: AdminOrderRow }) {
    if (order.intakeChoice === "wizard") {
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <ClipboardList className="size-3.5" />
                Wizard ingevuld
            </span>
        );
    }
    if (order.intakeChoice === "call") {
        const Icon =
            order.contactMethod === "phone"
                ? Phone
                : order.contactMethod === "video"
                    ? Video
                    : Mail;
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700">
                <Icon className="size-3.5" />
                Wil contact
            </span>
        );
    }
    return <span className="text-xs text-muted-foreground">Nog geen keuze</span>;
}

export function OrdersTable({ orders }: { orders: AdminOrderRow[] }) {
    const router = useRouter();

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
                <Inbox className="size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                    Nog geen aanvragen. Zodra iemand de onboarding doorloopt,
                    verschijnt de order hier.
                </p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Salon</TableHead>
                    <TableHead>Klant</TableHead>
                    <TableHead>Pakket</TableHead>
                    <TableHead>Intake</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Wachttijd</TableHead>
                    <TableHead className="text-right">Binnengekomen</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                    <TableRow
                        key={order.id}
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="cursor-pointer"
                    >
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium">{order.salonName}</span>
                                <span className="text-xs text-muted-foreground">
                                    {order.salonType}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium">{order.userName}</span>
                                <span className="text-xs text-muted-foreground">
                                    {order.userEmail}
                                    {order.userPhone ? ` · ${order.userPhone}` : ""}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="text-sm">{order.package}</TableCell>
                        <TableCell>
                            <IntakeCell order={order} />
                        </TableCell>
                        <TableCell>
                            <Badge
                                variant="outline"
                                className={cn("border", STATUS_STYLES[order.status])}
                            >
                                {STATUS_LABELS[order.status]}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                            <SlaTimer
                                since={order.createdAt}
                                active={SLA_ACTIVE_STATUSES.includes(order.status)}
                            />
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                            {dateFormatter.format(new Date(order.createdAt))}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
