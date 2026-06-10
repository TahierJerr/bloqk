import { AppSidebar } from "@/components/app-sidebar";
import { OrderProgress } from "@/components/onboarding/order-progress";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { getMollieClient } from "@/lib/mollie";
import prismadb from "@/lib/prismadb";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        const headersList = await headers();
        const pathname = headersList.get("x-invoke-path") ?? "/dashboard";
        redirect(`/sign-in?next=${pathname}`);
    }

    // Superadmins horen in het beheerdashboard, niet in een salonomgeving
    if (session.user.role === "SUPERADMIN") {
        redirect("/admin");
    }

    const staff = await prismadb.staff.findUnique({
        where: {
            userId: session.user.id,
        },
    });

    // Wel een account maar nog geen salon: onboarding afmaken
    if (!staff) {
        redirect("/start");
    }

    let order = await prismadb.order.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    // Vangnet voor als de Mollie-webhook ons niet bereikt (bijv. lokaal):
    // vraag de betaalstatus zelf op zolang er een betaling openstaat
    if (
        order?.status === "APPROVED" &&
        order.molliePaymentId &&
        process.env.MOLLIE_API_KEY
    ) {
        try {
            const payment = await getMollieClient().payments.get(order.molliePaymentId);
            if (payment.status === "paid") {
                order = await prismadb.order.update({
                    where: { id: order.id },
                    data: { status: "PAID" },
                });
            }
        } catch (error) {
            console.error("Mollie statuscheck mislukt:", error);
        }
    }

    // Tot de salon live is (ACTIVE) zien klanten de voortgang in plaats
    // van het dashboard
    if (order && order.status !== "ACTIVE") {
        return (
            <OrderProgress
                order={{
                    id: order.id,
                    status: order.status,
                    previewUrl: order.previewUrl,
                    package: order.package,
                    salonName: order.salonName,
                }}
            />
        );
    }

    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
        >
            <AppSidebar staff={staff} variant="inset" />
            <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
    );
}
