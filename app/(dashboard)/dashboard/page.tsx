import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { AppointmentsToday } from "@/components/appointments-today";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

const timeFormatter = new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
});

function startOfDay(date: Date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

function startOfWeek(date: Date) {
    const copy = startOfDay(date);
    // Maandag als eerste dag van de week
    const day = (copy.getDay() + 6) % 7;
    copy.setDate(copy.getDate() - day);
    return copy;
}

export default async function Page() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/sign-in");

    const me = await prismadb.staff.findUnique({
        where: { userId: session.user.id },
    });
    if (!me) redirect("/start");
    const salonId = me.salonId;

    const now = new Date();
    const dayStart = startOfDay(now);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const weekStart = startOfWeek(now);
    const lastWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Omzet telt bevestigde en afgeronde afspraken mee
    const revenueStatuses = ["CONFIRMED", "COMPLETED"] as const;

    const [
        todayAppointments,
        pendingCount,
        next,
        revenueThisWeek,
        revenueLastWeek,
        clientFirstSeen,
        noShowsThisMonth,
        noShowsLastMonth,
    ] = await Promise.all([
        prismadb.appointment.findMany({
            where: { salonId, startTime: { gte: dayStart, lt: dayEnd } },
            include: { staff: { select: { name: true } } },
            orderBy: { startTime: "asc" },
        }),
        prismadb.appointment.count({
            where: { salonId, status: "PENDING", startTime: { gte: now } },
        }),
        prismadb.appointment.findFirst({
            where: {
                salonId,
                startTime: { gte: now },
                status: { in: ["CONFIRMED", "PENDING"] },
            },
            orderBy: { startTime: "asc" },
        }),
        prismadb.appointment.aggregate({
            _sum: { servicePrice: true },
            where: {
                salonId,
                status: { in: [...revenueStatuses] },
                startTime: { gte: weekStart },
            },
        }),
        prismadb.appointment.aggregate({
            _sum: { servicePrice: true },
            where: {
                salonId,
                status: { in: [...revenueStatuses] },
                startTime: { gte: lastWeekStart, lt: weekStart },
            },
        }),
        // Eerste afspraak per klant, om nieuwe klanten deze week te herkennen
        prismadb.appointment.groupBy({
            by: ["clientEmail"],
            where: { salonId },
            _min: { startTime: true },
            _max: { startTime: true },
        }),
        prismadb.appointment.count({
            where: { salonId, status: "NO_SHOW", startTime: { gte: monthStart } },
        }),
        prismadb.appointment.count({
            where: {
                salonId,
                status: "NO_SHOW",
                startTime: { gte: lastMonthStart, lt: monthStart },
            },
        }),
    ]);

    const thisWeekRevenue = revenueThisWeek._sum.servicePrice ?? 0;
    const lastWeekRevenue = revenueLastWeek._sum.servicePrice ?? 0;
    const revenueChangePercent =
        lastWeekRevenue > 0
            ? Math.round(((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100)
            : thisWeekRevenue > 0
                ? 100
                : 0;

    const clientsThisWeek = clientFirstSeen.filter(
        (client) => client._max.startTime && client._max.startTime >= weekStart
    ).length;
    const newClientsThisWeek = clientFirstSeen.filter(
        (client) => client._min.startTime && client._min.startTime >= weekStart
    ).length;

    return (
        <>
            <SiteHeader title="Dashboard" />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <SectionCards
                            appointmentsToday={todayAppointments.length}
                            pendingAppointments={pendingCount}
                            nextAppointment={
                                next
                                    ? {
                                          clientName: next.clientName,
                                          time: timeFormatter.format(next.startTime),
                                      }
                                    : null
                            }
                            revenueThisWeek={thisWeekRevenue}
                            revenueChangePercent={revenueChangePercent}
                            clientsThisWeek={clientsThisWeek}
                            newClientsThisWeek={newClientsThisWeek}
                            noShowsThisMonth={noShowsThisMonth}
                            noShowsLastMonth={noShowsLastMonth}
                        />
                        <AppointmentsToday
                            appointments={todayAppointments.map((appointment) => ({
                                id: appointment.id,
                                clientName: appointment.clientName,
                                serviceName: appointment.serviceName,
                                staffName: appointment.staff?.name ?? "—",
                                startTime: timeFormatter.format(appointment.startTime),
                                endTime: timeFormatter.format(
                                    new Date(
                                        appointment.startTime.getTime() +
                                            appointment.durationMinutes * 60 * 1000
                                    )
                                ),
                                status: appointment.status,
                            }))}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
