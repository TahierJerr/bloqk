import { auth } from "./auth";
import prismadb from "./prismadb";

// Haalt de sessie en de meest recente order van de ingelogde gebruiker op,
// zodat de order-statusroutes dezelfde checks delen
export async function getSessionAndLatestOrder(headers: Headers) {
    const session = await auth.api.getSession({ headers });
    if (!session?.user) return null;

    const order = await prismadb.order.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    return { session, order };
}
