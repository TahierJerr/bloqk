import { getMollieClient } from "./mollie";
import prismadb from "./prismadb";
import { computeSubscriptions } from "./pricing";
import { getPricingConfig } from "./pricing-server";

function startDateFromNow(months: number) {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().slice(0, 10);
}

/**
 * Wordt aangeroepen zodra de eerste betaling van een order betaald is
 * (via de webhook of de lokale statuscheck). Zet de order op PAID en
 * start de Mollie-abonnementen op de mandate van die betaling.
 * Idempotent: bestaande abonnementen worden nooit dubbel aangemaakt.
 */
export async function handleFirstPaymentPaid(orderId: string, paymentId: string) {
    const order = await prismadb.order.findUnique({ where: { id: orderId } });
    if (!order || order.molliePaymentId !== paymentId) return;

    if (order.status === "APPROVED") {
        await prismadb.order.update({
            where: { id: order.id },
            data: { status: "PAID", lastPaymentStatus: "paid" },
        });
    }

    if (!order.mollieCustomerId || order.mollieSubscriptionIds.length > 0) return;

    const pricing = await getPricingConfig();
    const specs = computeSubscriptions(order, pricing);
    if (specs.length === 0) return;

    const mollie = getMollieClient();
    const subscriptionIds: string[] = [];
    try {
        for (const spec of specs) {
            const subscription = await mollie.customerSubscriptions.create({
                customerId: order.mollieCustomerId,
                amount: { currency: "EUR", value: (spec.amount / 100).toFixed(2) },
                interval: spec.interval,
                description: `${spec.description} – ${order.salonName}`,
                startDate: startDateFromNow(spec.startAfterMonths),
                ...(spec.times ? { times: spec.times } : {}),
                metadata: { orderId: order.id },
            });
            subscriptionIds.push(subscription.id);
        }
    } finally {
        // Ook bij een gedeeltelijke fout opslaan wat er wél is aangemaakt,
        // zodat een retry geen dubbele abonnementen start
        if (subscriptionIds.length > 0) {
            await prismadb.order.update({
                where: { id: order.id },
                data: { mollieSubscriptionIds: subscriptionIds },
            });
        }
    }
}
