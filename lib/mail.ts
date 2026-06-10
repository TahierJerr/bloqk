import nodemailer from "nodemailer";

const port = Number(process.env.SMTP_PORT ?? 587);

export const mailFrom = process.env.MAIL_FROM ?? "Bloqk <noreply@bloqk.nl>";

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.tem.scaleway.com",
    port,
    secure: port === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
