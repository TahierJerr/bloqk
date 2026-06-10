import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
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
        redirect(`/login?next=${pathname}`);
    }

    const staff = await prismadb.staff.findUnique({
        where: {
            userId: session.user.id,
        },
    });

    if (!staff) {
        redirect("/sign-in");
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
