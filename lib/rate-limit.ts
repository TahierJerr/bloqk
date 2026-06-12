// Standaard rate limiting voor alle API-routes, op basis van
// rate-limiter-flexible (in-memory; per proces). Sleutel is het
// client-IP, zodat één afzender nooit een route kan overspoelen.

import { NextRequest } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";

export type RateLimitConfig = {
  // Aantal toegestane verzoeken per venster
  points: number;
  // Vensterlengte in seconden
  duration: number;
};

export const RATE_LIMITS = {
  // Lezen van sessies e.d. (meerdere tabs pollen mee)
  authRead: { points: 120, duration: 60 },
  // Inloggen, OTP's, registratie via better-auth
  authWrite: { points: 20, duration: 60 },
  // Eenmalige/zware acties (aanvraag indienen, wachtwoord zetten,
  // bootstrap, uitnodiging accepteren)
  strict: { points: 5, duration: 900 },
  // Acties die e-mail versturen
  email: { points: 10, duration: 900 },
  // Gevoelige klantacties (betalen, intake, feedback, suggesties)
  sensitive: { points: 10, duration: 60 },
  // Regulier API-verkeer (admin, instellingen)
  standard: { points: 30, duration: 60 },
  // Externe webhooks (Mollie)
  webhook: { points: 60, duration: 60 },
} satisfies Record<string, RateLimitConfig>;

// Limiters overleven hot reloads in dev, net als de Prisma-client
const globalForLimiters = globalThis as unknown as {
  rateLimiters?: Map<string, RateLimiterMemory>;
};
const limiters = globalForLimiters.rateLimiters ?? new Map<string, RateLimiterMemory>();
globalForLimiters.rateLimiters = limiters;

function getLimiter(name: string, config: RateLimitConfig) {
  let limiter = limiters.get(name);
  if (!limiter) {
    limiter = new RateLimiterMemory({
      keyPrefix: name,
      points: config.points,
      duration: config.duration,
    });
    limiters.set(name, limiter);
  }
  return limiter;
}

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Geeft een 429-response terug als de afzender over de limiet zit,
 * anders null. Gebruik als eerste statement in een route handler:
 *
 *   const limited = await rateLimit(req, "order-pay", RATE_LIMITS.sensitive);
 *   if (limited) return limited;
 */
export async function rateLimit(
  req: NextRequest,
  name: string,
  config: RateLimitConfig,
): Promise<Response | null> {
  try {
    await getLimiter(name, config).consume(clientIp(req));
    return null;
  } catch (rejection) {
    const msBeforeNext =
      (rejection as { msBeforeNext?: number }).msBeforeNext ??
      config.duration * 1000;
    return Response.json(
      { error: "Te veel verzoeken. Probeer het over een moment opnieuw." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(msBeforeNext / 1000)) },
      },
    );
  }
}
