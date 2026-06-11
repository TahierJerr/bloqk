import { NextRequest } from "next/server";
import prismadb from "@/lib/prismadb";
import { getSessionAndLatestOrder } from "@/lib/order";
import { getMollieClient } from "@/lib/mollie";
import { getPricingConfig } from "@/lib/pricing-server";
import { computePaymentPlan } from "@/lib/pricing";

export async function POST(req: NextRequest) {
    try {
        const ctx = await getSessionAndLatestOrder(req.headers);
        if (!ctx) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { order } = ctx;
        if (!order || order.status !== "APPROVED") {
            return Response.json(
                { error: "Er staat geen betaling open voor je aanvraag" },
                { status: 400 }
            );
        }

        // Bedrag altijd server-side berekenen uit de actuele prijsconfiguratie
        const pricing = await getPricingConfig();
        const plan = computePaymentPlan(order, pricing);
        if (!plan) {
            return Response.json(
                { error: "We sturen je een voorstel op maat voor de betaling" },
                { status: 400 }
            );
        }

        const origin = req.nextUrl.origin;
        // Mollie accepteert geen webhook op localhost; lokaal vangt de
        // dashboard-laag de status op door de betaling zelf na te vragen
        const isLocal = /localhost|127\.0\.0\.1/.test(origin);

        const payment = await getMollieClient().payments.create({
            amount: { currency: "EUR", value: (plan.dueNow / 100).toFixed(2) },
            description: `Bloqk – ${order.salonName} (${
                order.billing === "yearly" ? "jaardeal" : "termijn 1 van 12"
            })`,
            redirectUrl: `${origin}/dashboard`,
            ...(isLocal ? {} : { webhookUrl: `${origin}/api/order/webhook` }),
            metadata: { orderId: order.id },
        });

        await prismadb.order.update({
            where: { id: order.id },
            data: {
                molliePaymentId: payment.id,
                lastPaymentStatus: payment.status,
            },
        });

        return Response.json({ checkoutUrl: payment.getCheckoutUrl() });
    } catch (error) {
        console.error("Payment Error:", error);
        return Response.json(
            { error: "De betaling kon niet worden gestart. Probeer het opnieuw." },
            { status: 500 }
        );
    }
}
