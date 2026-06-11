import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // Niet ingelogd: eerst inloggen
    if (!session) {
        redirect("/sign-in?next=/admin");
    }

    // Wel ingelogd maar geen superadmin: doen alsof deze pagina niet bestaat
    if (session.user.role !== "SUPERADMIN") {
        notFound();
    }

    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
        >
            <AdminSidebar
                user={{
                    name: session.user.name,
                    email: session.user.email,
                    imageUrl: session.user.image ?? null,
                }}
            />
            <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
    );
}
