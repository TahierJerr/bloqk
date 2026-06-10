import { NextRequest } from "next/server";
import { render } from "@react-email/render";
import prismadb from "@/lib/prismadb";
import { mailFrom, transporter } from "@/lib/mail";
import { orderSchema } from "@/lib/order-schema";
import { OrderConfirmationEmail } from "@/emails/order-confirmation";
import { OrderNotificationEmail } from "@/emails/order-notification";
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

export async function POST(req: NextRequest) {
    try {
        // 1. Verify Authentication (This gives us userId, name, and email)
        const session = await auth.api.getSession({
            headers: req.headers
        });

        if (!session || !session.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: userId, name, email } = session.user;

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

        // Genereer de unieke slug
        const baseSlug = slugify(salonName);
        const uniqueSlug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;
        
        // Bepaal het definitieve domein
        let finalDomain = `${uniqueSlug}.bloqk.nl`;
        if (hasDomain === "yes" && customDomain) {
            // Strip http:// en www. eraf zodat de database mooi schoon blijft
            finalDomain = customDomain.replace(/^(https?:\/\/)?(www\.)?/, '');
        }

        // 3. Execute the database transaction
        const result = await prismadb.$transaction(async (tx) => {
            const salon = await tx.salon.create({
                data: {
                    name: salonName,
                    slug: uniqueSlug,
                    domain: finalDomain, // Gebruik het nieuwe domein
                    address: address,
                    ownerId: userId,
                },
            });

            // B. Create the User's Staff Profile (Assigning them as OWNER)
            const staff = await tx.staff.create({
                data: {
                    name: name,
                    email: email,
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

        // 4. Send Emails asynchronously (using the order ID from the transaction)
        try {
            const [confirmationHtml, notificationHtml] = await Promise.all([
                render(
                    OrderConfirmationEmail({
                        name,
                        salonName,
                        salonType,
                        address,
                        pkg,
                    })
                ),
                render(
                    OrderNotificationEmail({
                        orderId: result.order.id,
                        name,
                        email,
                        salonName,
                        salonType,
                        address,
                        pkg,
                    })
                ),
            ]);

            await Promise.all([
                transporter.sendMail({
                    from: mailFrom,
                    to: email,
                    subject: "Je Bloqk-aanvraag is ontvangen",
                    html: confirmationHtml,
                }),
                transporter.sendMail({
                    from: mailFrom,
                    to: "support@bloqk.nl",
                    subject: `Nieuwe aanvraag: ${salonName}`,
                    html: notificationHtml,
                }),
            ]);
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