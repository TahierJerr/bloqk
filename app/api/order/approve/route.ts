import { NextRequest } from "next/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";
import { getSessionAndLatestOrder } from "@/lib/order";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "order-approve", RATE_LIMITS.sensitive);
  if (limited) return limited;

    try {
        const ctx = await getSessionAndLatestOrder(req.headers);
        if (!ctx) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { order } = ctx;
        if (!order || order.status !== "PREVIEW_SENT") {
            return Response.json(
                { error: "Er is geen preview om goed te keuren" },
                { status: 400 }
            );
        }

        await prismadb.order.update({
            where: { id: order.id },
            data: { status: "APPROVED" },
        });

        return Response.json({ message: "Preview goedgekeurd" });
    } catch (error) {
        console.error("Approve Error:", error);
        return Response.json(
            { error: "Er ging iets mis. Probeer het opnieuw." },
            { status: 500 }
        );
    }
}
