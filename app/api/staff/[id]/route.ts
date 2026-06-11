import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const owner = await prismadb.staff.findUnique({
            where: { userId: session.user.id },
        });
        if (!owner || owner.role !== "OWNER") {
            return Response.json(
                { error: "Alleen de eigenaar kan teamleden verwijderen" },
                { status: 403 }
            );
        }

        const { id } = await params;
        const target = await prismadb.staff.findUnique({ where: { id } });
        if (!target || target.salonId !== owner.salonId) {
            return Response.json({ error: "Teamlid niet gevonden" }, { status: 404 });
        }

        // Een eigenaar kan zichzelf (of een andere eigenaar) niet verwijderen
        if (target.id === owner.id || target.userId === session.user.id) {
            return Response.json(
                { error: "Je kunt jezelf niet verwijderen" },
                { status: 400 }
            );
        }
        if (target.role === "OWNER") {
            return Response.json(
                { error: "De eigenaar kan niet verwijderd worden" },
                { status: 400 }
            );
        }

        await prismadb.staff.delete({ where: { id } });
        return Response.json({ message: "Teamlid verwijderd" });
    } catch (error) {
        console.error("Staff Delete Error:", error);
        return Response.json(
            { error: "Het teamlid kon niet worden verwijderd" },
            { status: 500 }
        );
    }
}
