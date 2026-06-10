import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";
import { emailOTPClient } from "better-auth/client/plugins"; 

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // Ensure this matches your env dynamically in production
  plugins: [
    passkeyClient(),
    emailOTPClient() 
  ]
});