import { NextRequest } from "next/server";
import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const handlers = toNextJsHandler(auth);

// Lezen (sessies worden door meerdere tabs gepolld) krijgt een ruimere
// limiet dan schrijven (inloggen, OTP's, registratie)
export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, "auth-read", RATE_LIMITS.authRead);
  if (limited) return limited;

  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-write", RATE_LIMITS.authWrite);
  if (limited) return limited;

  return handlers.POST(req);
}
