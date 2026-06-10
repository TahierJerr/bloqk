import { auth } from "@/lib/auth";
import { ThemeProvider } from "next-themes";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        redirect(session.user.role === "SUPERADMIN" ? "/admin" : "/dashboard");
    }

    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
        </ThemeProvider>
    );
}
