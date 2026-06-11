import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

const acceptSchema = z.object({
    token: z.string().min(1),
    name: z.string().trim().min(2, "Vul je naam in"),
    password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
    try {
        const parsed = acceptSchema.safeParse(await req.json());
        if (!parsed.success) {
            return Response.json({ error: parsed.error.flatten() }, { status: 400 });
        }
        const { token, name, password } = parsed.data;

        const invite = await prismadb.staffInvite.findUnique({
            where: { token },
            include: { salon: true },
        });
        if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
            return Response.json(
                { error: "Deze uitnodiging is verlopen of al gebruikt" },
                { status: 400 }
            );
        }

        // Bestaat er al een account op dit adres, dan koppelen we dat;
        // anders maken we een nieuw account aan. De uitnodigingsmail is
        // het bewijs dat dit e-mailadres van de ontvanger is.
        let userId: string;
        const existingUser = await prismadb.user.findUnique({
            where: { email: invite.email },
        });
        if (existingUser) {
            userId = existingUser.id;
            const existingStaff = await prismadb.staff.findUnique({
                where: { userId },
            });
            if (existingStaff) {
                return Response.json(
                    { error: "Dit account is al gekoppeld aan een salon" },
                    { status: 400 }
                );
            }
        } else {
            const result = await auth.api.signUpEmail({
                body: { name, email: invite.email, password },
            });
            userId = result.user.id;
            await prismadb.user.update({
                where: { id: userId },
                data: { emailVerified: true },
            });
        }

        await prismadb.$transaction([
            prismadb.staff.create({
                data: {
                    name,
                    email: invite.email,
                    role: invite.role,
                    salonId: invite.salonId,
                    userId,
                },
            }),
            prismadb.staffInvite.update({
                where: { id: invite.id },
                data: { acceptedAt: new Date() },
            }),
        ]);

        return Response.json(
            { message: `Welkom bij ${invite.salon.name}` },
            { status: 201 }
        );
    } catch (error) {
        console.error("Accept Invite Error:", error);
        return Response.json(
            { error: "Het account kon niet worden aangemaakt" },
            { status: 500 }
        );
    }
}
