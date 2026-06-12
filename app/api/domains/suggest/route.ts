import { NextRequest } from "next/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { suggestAvailableDomains } from "@/lib/domains";

const suggestSchema = z.object({
    salonName: z.string().trim().min(2).max(100),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "domains-suggest", RATE_LIMITS.sensitive);
  if (limited) return limited;

    try {
        // Alleen voor ingelogde gebruikers (de onboarding zit achter de
        // auth wall), zodat de TransIP-API niet vrij aan te roepen is
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const parsed = suggestSchema.safeParse(await req.json());
        if (!parsed.success) {
            return Response.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        const suggestions = await suggestAvailableDomains(parsed.data.salonName, 9);
        return Response.json({ suggestions });
    } catch (error) {
        console.error("Domain Suggest Error:", error);
        return Response.json({ suggestions: [] });
    }
}
