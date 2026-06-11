import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { DAY_NAMES } from "@/lib/intake-schema";

export default async function SettingsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/sign-in");

    const me = await prismadb.staff.findUnique({
        where: { userId: session.user.id },
        include: {
            salon: {
                include: {
                    settings: {
                        include: { openingHours: { orderBy: { dayOfWeek: "asc" } } },
                    },
                },
            },
        },
    });
    if (!me) redirect("/start");

    const hours = me.salon.settings?.openingHours ?? [];
    // Altijd 7 dagen tonen, ook als er nog niets is opgeslagen
    const openingHours = DAY_NAMES.map((_, day) => {
        const saved = hours.find((hour) => hour.dayOfWeek === day);
        return {
            closed: saved ? saved.closed : day === 6,
            open: saved?.open ?? "09:00",
            close: saved?.close ?? "17:30",
        };
    });

    return (
        <>
            <SiteHeader title="Instellingen" />
            <div className="mx-auto w-full max-w-3xl px-4 py-6 lg:px-6">
                <SettingsForm
                    settings={{
                        phone: me.salon.phone ?? "",
                        email: me.salon.email ?? "",
                        openingHours,
                        canEdit: me.role === "OWNER" || me.role === "ADMIN",
                    }}
                />
            </div>
        </>
    );
}
