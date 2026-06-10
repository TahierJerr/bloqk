import { NextRequest } from "next/server";
import { render } from "@react-email/render";
import prismadb from "@/lib/prismadb";
import { mailFrom, transporter } from "@/lib/mail";
import { orderSchema } from "@/lib/order-schema";
import { OrderConfirmationEmail } from "@/emails/order-confirmation";
import { auth } from "@/lib/auth"; 

// Helper function to create a URL-friendly slug (e.g. "Studio Knip" -> "studio-knip")
function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

// Haalt de woonplaats uit een PDOK-adres ("Straat 12, 1234AB Plaats" -> "Plaats")
function extractCity(address: string | undefined) {
    if (!address) return null;
    const lastPart = address.split(",").pop()?.trim() ?? "";
    const city = lastPart.replace(/^\d{4}\s?[A-Za-z]{2}\s*/, "").trim();
    return city || null;
}

export async function POST(req: NextRequest) {
    try {
        // 1. Verify Authentication (This gives us userId, name, and email)
        const session = await auth.api.getSession({
            headers: req.headers
        });

        if (!session || !session.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: userId, name, email, phone } = session.user;

        // 2. Validate form payload
        const body = await req.json();
        const parsed = orderSchema.safeParse(body);

        if (!parsed.success) {
            return Response.json(
                { error: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { salonName, salonType, hasDomain, customDomain, address, package: pkg } = parsed.data;

        // Alleen bij een eigen domein krijgt de salon een domein en slug;
        // anders blijven beide leeg tot er een domein wordt gekozen
        let domain: string | null = null;
        let slug: string | null = null;
        if (hasDomain === "yes" && customDomain) {
            // Strip protocol, www. en eventueel pad zodat de database mooi schoon blijft
            domain = customDomain.trim().toLowerCase()
                .replace(/^(https?:\/\/)?(www\.)?/, '')
                .replace(/\/.*$/, '');
            // De slug is het domein zonder TLD ("mijn-salon.nl" -> "mijn-salon")
            const withoutTld = domain.includes(".")
                ? domain.split(".").slice(0, -1).join("-")
                : domain;
            slug = slugify(withoutTld) || null;
        }

        // 3. Execute the database transaction
        const result = await prismadb.$transaction(async (tx) => {
            const salon = await tx.salon.create({
                data: {
                    name: salonName,
                    slug,
                    domain,
                    address: address,
                    city: extractCity(address),
                    email: email,
                    phone: phone ?? null,
                    ownerId: userId,
                },
            });

            // B. Create the User's Staff Profile (Assigning them as OWNER)
            const staff = await tx.staff.create({
                data: {
                    name: name,
                    email: email,
                    phone: phone ?? null,
                    role: "OWNER",
                    salonId: salon.id,
                    userId: userId,
                },
            });

            // C. Create the Order Record for Billing/Tracking
            const order = await tx.order.create({
                data: {
                    salonName,
                    salonType,
                    address,
                    package: pkg,
                    userId,
                },
            });

            return { salon, staff, order };
        });

        // 4. Bevestiging naar de klant. Support krijgt pas bericht zodra de
        // intake (wizard of contactverzoek) is afgerond, via /api/order/intake
        try {
            const confirmationHtml = await render(
                OrderConfirmationEmail({
                    name,
                    salonName,
                    salonType,
                    address,
                    pkg,
                })
            );

            await transporter.sendMail({
                from: mailFrom,
                to: email,
                subject: "Je Bloqk-aanvraag is ontvangen",
                html: confirmationHtml,
            });
        } catch (mailError) {
            console.error("Order-e-mail kon niet worden verzonden:", mailError);
        }

        // Return success so the frontend knows to show the dopamine hit and redirect
        return Response.json(
            { 
                message: "Aanvraag ontvangen en workspace ingericht",
                data: { 
                    orderId: result.order.id,
                    salonId: result.salon.id 
                } 
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Provisioning Error:", error);
        return Response.json(
            { error: "Er ging iets mis bij het inrichten van je account" },
            { status: 500 }
        );
    }
}