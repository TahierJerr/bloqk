import { AppSidebar } from "@/components/app-sidebar"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { AppointmentsToday } from "@/components/appointments-today"

export default function Page() {
    return (
    <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)",} as React.CSSProperties}>
        <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <SectionCards
                        appointmentsToday={8}
                        pendingAppointments={2}
                        nextAppointment={{ clientName: "Sarah", time: "10:30" }}
                        revenueThisWeek={64000}
                        revenueChangePercent={8}
                        clientsThisWeek={24}
                        newClientsThisWeek={3}
                        noShowsThisMonth={2}
                        noShowsLastMonth={3}
                        />
                        <AppointmentsToday
                        appointments={[
                        {
                            id: "1",
                            clientName: "Sarah",
                            serviceName: "Knippen & föhnen",
                            staffName: "Barbara",
                            startTime: "10:30",
                            endTime: "11:30",
                            status: "CONFIRMED",
                        },
                        ]}
                        />
                    </div>
                </div>
            </div>
        </SidebarInset>
    </SidebarProvider>
    )}