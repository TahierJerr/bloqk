import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prismadb from "./prismadb";
import { passkey } from "@better-auth/passkey";
import { emailOTP } from "better-auth/plugins";
import { render } from "@react-email/components"; // You may need to import from "@react-email/render" depending on your package version
import { transporter, mailFrom } from "./mail";
import OtpEmail from "@/emails/otp-email";

export const auth = betterAuth({
    database: prismaAdapter(prismadb, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true, // You can leave this enabled if you want to support both, or set to false to enforce purely passwordless
    },
    user: {
        additionalFields: {
            phone: {
                type: "string",
                required: false,
                input: true,
            },
        },
    },
    plugins: [
        passkey(),
        emailOTP({
            async sendVerificationOTP({ email, otp, }) {
                // Render your existing React Email template to an HTML string
                // Note: Better Auth's hook doesn't provide the user's name during the sign-in step, so we leave it blank to fall back to "Verifieer je account"
                const html = await render(
                    OtpEmail({ 
                        otpCode: otp, 
                        expiresInMinutes: 5 // Default expiry is 300 seconds (5 mins)
                    })
                );

                // Send the email using your Scaleway SMTP setup
                await transporter.sendMail({
                    from: mailFrom,
                    to: email,
                    subject: "Je verificatiecode voor Bloqk",
                    html: html,
                });
            },
        }),
    ],
});