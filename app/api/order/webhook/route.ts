import { NextRequest } from "next/server";
import prismadb from "@/lib/prismadb";
import { getMollieClient } from "@/lib/mollie";

// Mollie post een x-www-form-urlencoded body met alleen het betalings-id;
// de status halen we vervolgens zelf bij Mollie op, dus de body is niet
// te spoofen. Altijd 200 teruggeven zodat Mollie niet blijft retryen.
//
// Mogelijke betaalstatussen (PaymentStatus in @mollie/api-client):
//   open       — checkout aangemaakt, nog geen betaalpoging afgerond
//   pending    — betaling gestart, wacht op bevestiging (bijv. overboeking)
//   authorized — bedrag gereserveerd, nog niet geïncasseerd
//   paid       — betaald: order door naar PAID
//   canceled   — klant heeft afgebroken: betaling loskoppelen voor retry
//   expired    — checkout verlopen: idem
//   failed     — betaling mislukt: idem
export async function POST(req: NextRequest) {
    try {
        const form = await req.formData();
        const paymentId = form.get("id");
        if (typeof paymentId !== "string" || !paymentId) {
            return new Response("Missing id", { status: 400 });
        }

        const payment = await getMollieClient().payments.get(paymentId);
        const orderId = (payment.metadata as { orderId?: string } | null)?.orderId;
        if (!orderId) return new Response("OK");

        switch (payment.status) {
            case "paid":
                await prismadb.order.updateMany({
                    where: {
                        id: orderId,
                        molliePaymentId: paymentId,
                        status: "APPROVED",
                    },
                    data: { status: "PAID", lastPaymentStatus: "paid" },
                });
                break;

            case "canceled":
            case "expired":
            case "failed":
                // Betaling loskoppelen zodat de klant opnieuw kan afrekenen
                await prismadb.order.updateMany({
                    where: { id: orderId, molliePaymentId: paymentId },
                    data: {
                        molliePaymentId: null,
                        lastPaymentStatus: payment.status,
                    },
                });
                break;

            default:
                // open / pending / authorized: alleen de status bijhouden
                await prismadb.order.updateMany({
                    where: { id: orderId, molliePaymentId: paymentId },
                    data: { lastPaymentStatus: payment.status },
                });
        }

        return new Response("OK");
    } catch (error) {
        console.error("Mollie Webhook Error:", error);
        return new Response("OK");
    }
}
