import { NextRequest } from "next/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

const actionSchema = z.discriminatedUnion("action", [
    z.object({
        action: z.literal("preview_ready"),
        previewUrl: z.url(),
    }),
    z.object({
        action: z.literal("activate"),
    }),
]);

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  const limited = await rateLimit(req, "admin-orders", RATE_LIMITS.standard);
  if (limited) return limited;

    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session || session.user.role !== "SUPERADMIN") {
            return Response.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const order = await prismadb.order.findUnique({ where: { id } });
        if (!order) {
            return Response.json({ error: "Order niet gevonden" }, { status: 404 });
        }

        const parsed = actionSchema.safeParse(await req.json());
        if (!parsed.success) {
            return Response.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        if (parsed.data.action === "preview_ready") {
            // Toegestaan vanuit PENDING (eerste preview) en PREVIEW_SENT
            // (link bijwerken na feedback)
            if (order.status !== "PENDING" && order.status !== "PREVIEW_SENT") {
                return Response.json(
                    { error: `De preview kan niet verstuurd worden vanuit status ${order.status}` },
                    { status: 400 }
                );
            }
            await prismadb.order.update({
                where: { id },
                data: {
                    status: "PREVIEW_SENT",
                    previewUrl: parsed.data.previewUrl,
                },
            });
            return Response.json({ message: "Preview verstuurd" });
        }

        // activate
        if (order.status !== "PAID") {
            return Response.json(
                { error: "Alleen betaalde orders kunnen live gezet worden" },
                { status: 400 }
            );
        }
        await prismadb.order.update({
            where: { id },
            data: { status: "ACTIVE" },
        });
        return Response.json({ message: "Salon staat live" });
    } catch (error) {
        console.error("Admin Order Error:", error);
        return Response.json(
            { error: "Er ging iets mis. Probeer het opnieuw." },
            { status: 500 }
        );
    }
}
