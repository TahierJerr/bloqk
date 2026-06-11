import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { StaffManager } from "@/components/dashboard/staff-manager";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export default async function StaffPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/sign-in");

    const me = await prismadb.staff.findUnique({
        where: { userId: session.user.id },
    });
    if (!me) redirect("/start");

    const [staff, invites] = await Promise.all([
        prismadb.staff.findMany({
            where: { salonId: me.salonId },
            orderBy: [{ role: "asc" }, { createdAt: "asc" }],
        }),
        prismadb.staffInvite.findMany({
            where: {
                salonId: me.salonId,
                acceptedAt: null,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
        }),
    ]);

    return (
        <>
            <SiteHeader title="Team" />
            <div className="mx-auto w-full max-w-3xl px-4 py-6 lg:px-6">
                <StaffManager
                    isOwner={me.role === "OWNER"}
                    staff={staff.map((member) => ({
                        id: member.id,
                        name: member.name,
                        email: member.email,
                        imageUrl: member.imageUrl,
                        role: member.role,
                        isSelf: member.id === me.id,
                    }))}
                    invites={invites.map((invite) => ({
                        id: invite.id,
                        email: invite.email,
                        expiresAt: invite.expiresAt.toISOString(),
                    }))}
                />
            </div>
        </>
    );
}
