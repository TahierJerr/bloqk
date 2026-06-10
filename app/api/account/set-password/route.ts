import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

const setPasswordSchema = z.object({
    password: z.string().min(8).max(128),
});

// Koppelt een wachtwoord aan een account dat via e-mailcode is aangemaakt,
// zodat klanten na de onboarding ook met e-mail + wachtwoord kunnen inloggen
export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const parsed = setPasswordSchema.safeParse(await req.json());
        if (!parsed.success) {
            return Response.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        // Alleen toestaan als er nog géén wachtwoord is; een bestaand
        // wachtwoord wijzig je via change-password (met huidig wachtwoord)
        const credential = await prismadb.account.findFirst({
            where: { userId: session.user.id, providerId: "credential" },
        });
        if (credential) {
            return Response.json(
                { error: "Er is al een wachtwoord ingesteld" },
                { status: 400 }
            );
        }

        await auth.api.setPassword({
            body: { newPassword: parsed.data.password },
            headers: req.headers,
        });

        return Response.json({ message: "Wachtwoord ingesteld" });
    } catch (error) {
        console.error("Set Password Error:", error);
        return Response.json(
            { error: "Het wachtwoord kon niet worden ingesteld" },
            { status: 500 }
        );
    }
}
