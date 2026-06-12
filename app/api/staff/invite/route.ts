import { NextRequest } from "next/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { randomBytes } from "crypto";
import { z } from "zod";
import { render } from "@react-email/render";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { mailFrom, transporter } from "@/lib/mail";
import { StaffInviteEmail } from "@/emails/staff-invite";

const inviteSchema = z.object({
    email: z.email("Vul een geldig e-mailadres in"),
});

const INVITE_VALID_DAYS = 7;

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "staff-invite", RATE_LIMITS.email);
  if (limited) return limited;

    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Alleen de eigenaar mag teamleden uitnodigen
        const owner = await prismadb.staff.findUnique({
            where: { userId: session.user.id },
            include: { salon: true },
        });
        if (!owner || owner.role !== "OWNER") {
            return Response.json(
                { error: "Alleen de eigenaar kan teamleden uitnodigen" },
                { status: 403 }
            );
        }

        const parsed = inviteSchema.safeParse(await req.json());
        if (!parsed.success) {
            return Response.json({ error: parsed.error.flatten() }, { status: 400 });
        }
        const email = parsed.data.email.toLowerCase();

        const existingStaff = await prismadb.staff.findFirst({
            where: { salonId: owner.salonId, email },
        });
        if (existingStaff) {
            return Response.json(
                { error: "Dit e-mailadres is al teamlid van je salon" },
                { status: 400 }
            );
        }

        // Eerdere openstaande uitnodigingen voor dit adres vervangen
        await prismadb.staffInvite.deleteMany({
            where: { salonId: owner.salonId, email, acceptedAt: null },
        });

        const invite = await prismadb.staffInvite.create({
            data: {
                token: randomBytes(32).toString("base64url"),
                email,
                salonId: owner.salonId,
                expiresAt: new Date(Date.now() + INVITE_VALID_DAYS * 24 * 60 * 60 * 1000),
            },
        });

        const inviteUrl = `${req.nextUrl.origin}/staff-signup?token=${invite.token}`;
        const html = await render(
            StaffInviteEmail({
                salonName: owner.salon.name,
                inviterName: session.user.name,
                inviteUrl,
                expiresInDays: INVITE_VALID_DAYS,
            })
        );
        await transporter.sendMail({
            from: mailFrom,
            to: email,
            subject: `Je bent uitgenodigd voor het team van ${owner.salon.name}`,
            html,
        });

        return Response.json({ message: "Uitnodiging verstuurd" }, { status: 201 });
    } catch (error) {
        console.error("Invite Error:", error);
        return Response.json(
            { error: "De uitnodiging kon niet worden verstuurd" },
            { status: 500 }
        );
    }
}
