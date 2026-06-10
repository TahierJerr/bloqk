import { AppSidebar } from "@/components/app-sidebar";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { ThemeProvider } from "next-themes";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


export default async function RootLayout({
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
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-full flex flex-col">
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                    <AppSidebar staff={staff} variant="inset" />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}