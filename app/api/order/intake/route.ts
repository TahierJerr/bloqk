import { NextRequest } from "next/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { render } from "@react-email/render";
import prismadb from "@/lib/prismadb";
import { getSessionAndLatestOrder } from "@/lib/order";
import {
    CONTACT_METHOD_LABELS,
    DAY_NAMES,
    intakeSchema,
} from "@/lib/intake-schema";
import { mailFrom, transporter } from "@/lib/mail";
import { ContactRequestEmail } from "@/emails/contact-request-notification";
import { WizardCompleteEmail } from "@/emails/wizard-complete-notification";
import { siteConfig } from "@/lib/site";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "order-intake", RATE_LIMITS.sensitive);
  if (limited) return limited;

    try {
        const ctx = await getSessionAndLatestOrder(req.headers);
        if (!ctx) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { session, order } = ctx;
        if (!order || order.status !== "PENDING") {
            return Response.json(
                { error: "Er is geen openstaande aanvraag" },
                { status: 400 }
            );
        }
        if (order.intakeChoice) {
            return Response.json(
                { error: "De intake is al afgerond" },
                { status: 400 }
            );
        }

        const parsed = intakeSchema.safeParse(await req.json());
        if (!parsed.success) {
            return Response.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        const data = parsed.data;
        const adminUrl = `${siteConfig.url}/admin/orders/${order.id}`;

        if (data.choice === "call") {
            await prismadb.order.update({
                where: { id: order.id },
                data: {
                    intakeChoice: "call",
                    contactMethod: data.contactMethod,
                    intakeCompletedAt: new Date(),
                },
            });

            await sendSupportMail(
                `📞 Contactverzoek: ${order.salonName}`,
                await render(
                    ContactRequestEmail({
                        orderId: order.id,
                        salonName: order.salonName,
                        salonType: order.salonType,
                        pkg: order.package,
                        customerName: session.user.name,
                        customerEmail: session.user.email,
                        customerPhone: session.user.phone,
                        methodLabel: CONTACT_METHOD_LABELS[data.contactMethod],
                        adminUrl,
                    })
                )
            );

            return Response.json({ message: "Contactverzoek ontvangen" });
        }

        // Wizard: branding, openingstijden en diensten opslaan bij de salon
        const salon = await prismadb.salon.findUnique({
            where: { ownerId: session.user.id },
        });
        if (!salon) {
            return Response.json(
                { error: "Geen salon gevonden bij dit account" },
                { status: 400 }
            );
        }

        await prismadb.$transaction(async (tx) => {
            const settings = await tx.salonSettings.upsert({
                where: { salonId: salon.id },
                create: {
                    salonId: salon.id,
                    logoUrl: data.logo,
                    photoUrls: data.photos,
                    primaryColor: data.colors.primary,
                    secondaryColor: data.colors.secondary,
                    accentColor: data.colors.accent,
                    extraInfo: data.extraInfo || null,
                },
                update: {
                    logoUrl: data.logo,
                    photoUrls: data.photos,
                    primaryColor: data.colors.primary,
                    secondaryColor: data.colors.secondary,
                    accentColor: data.colors.accent,
                    extraInfo: data.extraInfo || null,
                },
            });

            await tx.openingHours.deleteMany({ where: { settingsId: settings.id } });
            await tx.openingHours.createMany({
                data: data.openingHours.map((hour) => ({
                    settingsId: settings.id,
                    dayOfWeek: hour.day,
                    closed: hour.closed,
                    open: hour.closed ? null : hour.open,
                    close: hour.closed ? null : hour.close,
                })),
            });

            await tx.service.createMany({
                data: data.services.map((service) => ({
                    salonId: salon.id,
                    name: service.name,
                    duration: service.duration,
                    price: service.price,
                })),
            });

            await tx.order.update({
                where: { id: order.id },
                data: {
                    intakeChoice: "wizard",
                    intakeCompletedAt: new Date(),
                },
            });
        });

        await sendSupportMail(
            `🚀 Wizard ingevuld: ${order.salonName}`,
            await render(
                WizardCompleteEmail({
                    orderId: order.id,
                    salonName: order.salonName,
                    salonType: order.salonType,
                    pkg: order.package,
                    customerName: session.user.name,
                    customerEmail: session.user.email,
                    customerPhone: session.user.phone,
                    hasLogo: Boolean(data.logo),
                    photoCount: data.photos.length,
                    colors: data.colors,
                    openingHours: data.openingHours.map((hour) => ({
                        day: DAY_NAMES[hour.day] ?? `Dag ${hour.day}`,
                        value: hour.closed ? "Gesloten" : `${hour.open} – ${hour.close}`,
                    })),
                    services: data.services.map((service) => ({
                        name: service.name,
                        value: `${service.duration} min · €${(service.price / 100)
                            .toFixed(2)
                            .replace(".", ",")}`,
                    })),
                    extraInfo: data.extraInfo || null,
                    adminUrl,
                })
            )
        );

        return Response.json({ message: "Intake afgerond" });
    } catch (error) {
        console.error("Intake Error:", error);
        return Response.json(
            { error: "Er ging iets mis. Probeer het opnieuw." },
            { status: 500 }
        );
    }
}

// Support-mail mag de request nooit laten falen
async function sendSupportMail(subject: string, html: string) {
    try {
        await transporter.sendMail({
            from: mailFrom,
            to: "support@bloqk.nl",
            subject,
            html,
        });
    } catch (mailError) {
        console.error("Support-e-mail kon niet worden verzonden:", mailError);
    }
}
