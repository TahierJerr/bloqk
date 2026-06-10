import { NextRequest } from "next/server";
import prismadb from "@/lib/prismadb";
import { getSessionAndLatestOrder } from "@/lib/order";
import { FEEDBACK_REASON_LABELS, orderFeedbackSchema } from "@/lib/order-schema";
import { mailFrom, transporter } from "@/lib/mail";

export async function POST(req: NextRequest) {
    try {
        const ctx = await getSessionAndLatestOrder(req.headers);
        if (!ctx) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { session, order } = ctx;
        if (!order || order.status !== "PREVIEW_SENT") {
            return Response.json(
                { error: "Er is geen preview om feedback op te geven" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const parsed = orderFeedbackSchema.safeParse(body);
        if (!parsed.success) {
            return Response.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        const { reason, message } = parsed.data;

        // Annuleren stopt de aanvraag; in alle andere gevallen gaan we
        // terug naar de bouwfase en passen we de pagina aan
        await prismadb.order.update({
            where: { id: order.id },
            data: {
                status: reason === "cancel" ? "CANCELLED" : "PENDING",
                feedbackReason: reason,
                feedbackMessage: message || null,
            },
        });

        // Stuur de feedback door naar support; mag de request niet laten falen
        try {
            await transporter.sendMail({
                from: mailFrom,
                to: "support@bloqk.nl",
                subject: `Preview-feedback: ${order.salonName} (${FEEDBACK_REASON_LABELS[reason]})`,
                text: [
                    `Salon: ${order.salonName}`,
                    `Klant: ${session.user.name} (${session.user.email})`,
                    `Order: ${order.id}`,
                    `Reden: ${FEEDBACK_REASON_LABELS[reason]}`,
                    "",
                    message || "(geen toelichting)",
                ].join("\n"),
            });
        } catch (mailError) {
            console.error("Feedback-e-mail kon niet worden verzonden:", mailError);
        }

        return Response.json({ message: "Feedback ontvangen" });
    } catch (error) {
        console.error("Feedback Error:", error);
        return Response.json(
            { error: "Er ging iets mis. Probeer het opnieuw." },
            { status: 500 }
        );
    }
}
