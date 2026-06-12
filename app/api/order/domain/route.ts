import { NextRequest } from "next/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { z } from "zod";
import prismadb from "@/lib/prismadb";
import { getSessionAndLatestOrder } from "@/lib/order";
import { createZoneWithDns } from "@/lib/cloudflare";
import { requestDomainTransfer, setNameservers } from "@/lib/transip";

const domainChoiceSchema = z.discriminatedUnion("choice", [
  z.object({
    choice: z.literal("managed"),
    // Verhuiscode mag later: leeg laten kan altijd nog
    eppCode: z.string().trim().min(4).max(100).or(z.literal("")).optional(),
  }),
  z.object({
    choice: z.literal("self"),
  }),
]);

// Domeinbeheer-keuze na betaling: Bloqk beheert (Cloudflare-zone +
// overdracht naar ons TransIP-account) of de klant beheert zelf
// (die krijgt de DNS-instellingen te zien).
export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "order-domain", RATE_LIMITS.sensitive);
  if (limited) return limited;

  try {
    const ctx = await getSessionAndLatestOrder(req.headers);
    if (!ctx) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { session, order } = ctx;
    if (!order || (order.status !== "PAID" && order.status !== "ACTIVE")) {
      return Response.json(
        { error: "Deze keuze kan pas na de betaling gemaakt worden" },
        { status: 400 },
      );
    }
    if (order.domainSource !== "existing") {
      return Response.json(
        { error: "Deze order heeft geen eigen domein" },
        { status: 400 },
      );
    }

    const salon = await prismadb.salon.findUnique({
      where: { ownerId: session.user.id },
      select: { domain: true },
    });
    if (!salon?.domain) {
      return Response.json({ error: "Geen domein gevonden" }, { status: 400 });
    }
    const domain = salon.domain;

    const parsed = domainChoiceSchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;

    if (data.choice === "self") {
      await prismadb.order.update({
        where: { id: order.id },
        data: { dnsChoice: "self" },
      });
      return Response.json({ message: "Je beheert je domein zelf" });
    }

    // Beheerd door Bloqk; verhuiscode mag nu of later
    const eppCode = data.eppCode?.trim() || null;
    await prismadb.order.update({
      where: { id: order.id },
      data: { dnsChoice: "managed", ...(eppCode ? { eppCode } : {}) },
    });

    // Met verhuiscode (en nog geen lopende aanvraag): zone + overdracht
    if (eppCode && !order.transferRequestedAt) {
      // 1. Cloudflare-zone (idempotent) levert ook de toegewezen nameservers
      let zoneId: string | null = order.cloudflareZoneId;
      let nameServers: string[] = order.cloudflareNameservers;
      try {
        const zone = await createZoneWithDns(domain);
        if (zone) {
          zoneId = zone.zoneId;
          nameServers = zone.nameServers;
        }
      } catch (cfError) {
        console.error(`Cloudflare-zone voor ${domain} mislukt:`, cfError);
      }

      // 2. Overdracht aanvragen mét de Cloudflare-nameservers, zodat ze
      // direct bij afronding actief zijn
      let transferRequested = false;
      try {
        transferRequested = await requestDomainTransfer(domain, eppCode, nameServers);
      } catch (transferError) {
        console.error(`Overdracht van ${domain} mislukt:`, transferError);
      }

      // 3. Geweigerde overdracht kan betekenen dat het domein al in ons
      // account zit; dan zetten we de nameservers direct
      if (!transferRequested && nameServers.length > 0) {
        try {
          await setNameservers(domain, nameServers);
        } catch (nsError) {
          console.error(`Nameservers voor ${domain} niet gezet:`, nsError);
        }
      }

      await prismadb.order.update({
        where: { id: order.id },
        data: {
          ...(zoneId ? { cloudflareZoneId: zoneId } : {}),
          ...(nameServers.length > 0 ? { cloudflareNameservers: nameServers } : {}),
          ...(transferRequested ? { transferRequestedAt: new Date() } : {}),
        },
      });
    }

    return Response.json({
      message: eppCode
        ? "We hebben je verhuiscode ontvangen en zetten de overdracht in gang"
        : "Keuze opgeslagen; vul je verhuiscode in zodra je hem hebt",
    });
  } catch (error) {
    console.error("Domain Choice Error:", error);
    return Response.json(
      { error: "Er ging iets mis. Probeer het opnieuw." },
      { status: 500 },
    );
  }
}
