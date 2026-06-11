import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { openingHourSchema } from "@/lib/intake-schema";

const settingsSchema = z.object({
    phone: z
        .string()
        .trim()
        .regex(/^\+?[0-9][0-9 ()-]{7,18}$/, "Vul een geldig telefoonnummer in")
        .or(z.literal(""))
        .optional(),
    email: z.email("Vul een geldig e-mailadres in").or(z.literal("")).optional(),
    openingHours: z.array(openingHourSchema).length(7),
});

export async function PATCH(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Alleen eigenaar of beheerder mag saloninstellingen wijzigen
        const staff = await prismadb.staff.findUnique({
            where: { userId: session.user.id },
        });
        if (!staff || (staff.role !== "OWNER" && staff.role !== "ADMIN")) {
            return Response.json(
                { error: "Alleen de eigenaar of beheerder kan instellingen wijzigen" },
                { status: 403 }
            );
        }

        const parsed = settingsSchema.safeParse(await req.json());
        if (!parsed.success) {
            return Response.json({ error: parsed.error.flatten() }, { status: 400 });
        }
        const { phone, email, openingHours } = parsed.data;

        await prismadb.$transaction(async (tx) => {
            await tx.salon.update({
                where: { id: staff.salonId },
                data: {
                    phone: phone?.trim() || null,
                    email: email?.trim() || null,
                },
            });

            const settings = await tx.salonSettings.upsert({
                where: { salonId: staff.salonId },
                create: { salonId: staff.salonId },
                update: {},
            });

            await tx.openingHours.deleteMany({ where: { settingsId: settings.id } });
            await tx.openingHours.createMany({
                data: openingHours.map((hour) => ({
                    settingsId: settings.id,
                    dayOfWeek: hour.day,
                    closed: hour.closed,
                    open: hour.closed ? null : hour.open,
                    close: hour.closed ? null : hour.close,
                })),
            });
        });

        return Response.json({ message: "Instellingen opgeslagen" });
    } catch (error) {
        console.error("Settings Error:", error);
        return Response.json(
            { error: "De instellingen konden niet worden opgeslagen" },
            { status: 500 }
        );
    }
}
