import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prismadb from "./prismadb";

export const auth = betterAuth({
    database: prismaAdapter(prismadb, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    }
});