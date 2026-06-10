import { notFound } from "next/navigation";
import { AdminSignUpForm } from "@/components/auth/admin-sign-up-form";
import { Logo } from "@/components/logo";
import prismadb from "@/lib/prismadb";

export default async function Page() {
    // Zodra de eerste superadmin bestaat, bestaat deze pagina niet meer;
    // nieuwe klanten registreren via de onboarding op /start
    const superAdminCount = await prismadb.user.count({
        where: { role: "SUPERADMIN" },
    });
    if (superAdminCount > 0) {
        notFound();
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Logo className="flex justify-center mb-6" />
                <AdminSignUpForm />
            </div>
        </div>
    );
}
