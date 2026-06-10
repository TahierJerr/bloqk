import { Logo } from "@/components/logo";
import {
    STATUS_LABELS,
    STATUS_ORDER,
    STATUS_STYLES,
} from "@/components/admin/order-status";
import { OrdersTable } from "@/components/admin/orders-table";
import { cn } from "@/lib/utils";
import prismadb from "@/lib/prismadb";

export default async function AdminPage() {
    const orders = await prismadb.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { name: true, email: true, phone: true } },
        },
    });

    const counts = STATUS_ORDER.map((status) => ({
        status,
        count: orders.filter((order) => order.status === status).length,
    }));

    return (
        <main className="mx-auto w-full max-w-6xl px-6 py-10">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <Logo size="sm" />
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight">
                        Aanvragen
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Alle binnengekomen orders, nieuwste eerst. Klik op een order
                        voor details en acties.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {counts.map(({ status, count }) => (
                        <div
                            key={status}
                            className={cn(
                                "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                                STATUS_STYLES[status]
                            )}
                        >
                            {STATUS_LABELS[status]}
                            <span className="font-semibold">{count}</span>
                        </div>
                    ))}
                </div>
            </header>

            <div className="mt-8 overflow-hidden rounded-2xl border bg-card">
                <OrdersTable
                    orders={orders.map((order) => ({
                        id: order.id,
                        salonName: order.salonName,
                        salonType: order.salonType,
                        package: order.package,
                        status: order.status,
                        intakeChoice: order.intakeChoice,
                        contactMethod: order.contactMethod,
                        userName: order.user.name,
                        userEmail: order.user.email,
                        userPhone: order.user.phone,
                        createdAt: order.createdAt.toISOString(),
                    }))}
                />
            </div>
        </main>
    );
}
