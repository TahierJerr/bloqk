import { NextRequest } from "next/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

const bootstrapSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8).max(128),
});

// Maakt het allereerste superadmin-account aan. Zodra er een superadmin
// bestaat, is deze route (en de /sign-up pagina) definitief dicht.
export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "admin-bootstrap", RATE_LIMITS.strict);
  if (limited) return limited;

    try {
        const superAdminCount = await prismadb.user.count({
            where: { role: "SUPERADMIN" },
        });
        if (superAdminCount > 0) {
            return Response.json(
                { error: "Registratie is gesloten" },
                { status: 403 }
            );
        }

        const parsed = bootstrapSchema.safeParse(await req.json());
        if (!parsed.success) {
            return Response.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        const { name, email, password } = parsed.data;

        const result = await auth.api.signUpEmail({
            body: { name, email: email.toLowerCase(), password },
        });

        // Rol kan alleen server-side gezet worden (input: false in de
        // auth-config), dus elevatie gebeurt expliciet hier
        await prismadb.user.update({
            where: { id: result.user.id },
            data: { role: "SUPERADMIN", emailVerified: true },
        });

        return Response.json({ message: "Superadmin aangemaakt" }, { status: 201 });
    } catch (error) {
        console.error("Bootstrap Error:", error);
        return Response.json(
            { error: "Het account kon niet worden aangemaakt" },
            { status: 500 }
        );
    }
}
