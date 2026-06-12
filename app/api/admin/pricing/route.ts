import { NextRequest } from "next/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { getPricingConfig } from "@/lib/pricing-server";

// Bedragen in centen
const cents = z.number().int().min(0).max(10_000_000);

const pricingSchema = z.object({
    websiteBase: cents,
    websiteSplitTotal: cents,
    websiteUpfront: cents,
    subMonthly: cents,
    subYearly: cents,
    hostingShare: cents,
    softwareShare: cents,
});

export async function PATCH(req: NextRequest) {
  const limited = await rateLimit(req, "admin-pricing", RATE_LIMITS.standard);
  if (limited) return limited;

    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session || session.user.role !== "SUPERADMIN") {
            return Response.json({ error: "Unauthorized" }, { status: 403 });
        }

        const parsed = pricingSchema.safeParse(await req.json());
        if (!parsed.success) {
            return Response.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        const current = await getPricingConfig();
        const updated = await prismadb.pricingConfig.update({
            where: { id: current.id },
            data: parsed.data,
        });

        return Response.json({ message: "Prijzen opgeslagen", data: updated });
    } catch (error) {
        console.error("Pricing Error:", error);
        return Response.json(
            { error: "De prijzen konden niet worden opgeslagen" },
            { status: 500 }
        );
    }
}
