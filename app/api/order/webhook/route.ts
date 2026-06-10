import { NextRequest } from "next/server";
import prismadb from "@/lib/prismadb";
import { getMollieClient } from "@/lib/mollie";

// Mollie post een x-www-form-urlencoded body met alleen het betalings-id;
// de status halen we vervolgens zelf bij Mollie op, dus de body is niet
// te spoofen. Altijd 200 teruggeven zodat Mollie niet blijft retryen.
export async function POST(req: NextRequest) {
    try {
        const form = await req.formData();
        const paymentId = form.get("id");
        if (typeof paymentId !== "string" || !paymentId) {
            return new Response("Missing id", { status: 400 });
        }

        const payment = await getMollieClient().payments.get(paymentId);
        const orderId = (payment.metadata as { orderId?: string } | null)?.orderId;

        if (payment.status === "paid" && orderId) {
            await prismadb.order.updateMany({
                where: {
                    id: orderId,
                    molliePaymentId: paymentId,
                    status: "APPROVED",
                },
                data: { status: "PAID" },
            });
        }

        return new Response("OK");
    } catch (error) {
        console.error("Mollie Webhook Error:", error);
        return new Response("OK");
    }
}
