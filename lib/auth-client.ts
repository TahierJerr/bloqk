import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [
    passkeyClient()
  ]
});
