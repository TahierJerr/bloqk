import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";
import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // Ensure this matches your env dynamically in production
  plugins: [
    passkeyClient(),
    emailOTPClient(),
    inferAdditionalFields<typeof auth>()
  ]
});