import { AppSidebar } from "@/components/app-sidebar";
import { OrderProgress } from "@/components/onboarding/order-progress";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { getMollieClient } from "@/lib/mollie";
import { computePaymentPlan } from "@/lib/pricing";
import { getPricingConfig } from "@/lib/pricing-server";
import prismadb from "@/lib/prismadb";
import { handleFirstPaymentPaid } from "@/lib/subscriptions";
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
    // vraag de betaalstatus zelf op zolang er een betaling openstaat, en
    // reageer op alle Mollie-statussen net als de webhook
    if (
        order?.status === "APPROVED" &&
        order.molliePaymentId &&
        process.env.MOLLIE_API_KEY
    ) {
        try {
            const payment = await getMollieClient().payments.get(order.molliePaymentId);
            if (payment.status === "paid") {
                // Zet de order op PAID en start de abonnementen (zelfde pad
                // als de webhook)
                await handleFirstPaymentPaid(order.id, order.molliePaymentId);
                order = await prismadb.order.findUniqueOrThrow({
                    where: { id: order.id },
                });
            } else if (
                payment.status === "canceled" ||
                payment.status === "expired" ||
                payment.status === "failed"
            ) {
                // Loskoppelen zodat de klant opnieuw kan afrekenen
                order = await prismadb.order.update({
                    where: { id: order.id },
                    data: { molliePaymentId: null, lastPaymentStatus: payment.status },
                });
            } else if (payment.status !== order.lastPaymentStatus) {
                order = await prismadb.order.update({
                    where: { id: order.id },
                    data: { lastPaymentStatus: payment.status },
                });
            }
        } catch (error) {
            console.error("Mollie statuscheck mislukt:", error);
        }
    }

    // Tot de salon live is (ACTIVE) zien klanten de voortgang in plaats
    // van het dashboard
    if (order && order.status !== "ACTIVE") {
        // Betaalplan (bedrag + opbouw) server-side berekenen uit de
        // actuele prijsconfiguratie
        const payment =
            order.status === "APPROVED"
                ? computePaymentPlan(order, await getPricingConfig())
                : null;

        return (
            <OrderProgress
                order={{
                    id: order.id,
                    status: order.status,
                    previewUrl: order.previewUrl,
                    package: order.package,
                    salonName: order.salonName,
                    intakeChoice: order.intakeChoice,
                    contactMethod: order.contactMethod,
                    billing: order.billing,
                    lastPaymentStatus: order.lastPaymentStatus,
                    payment,
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
