// Domeinoverdracht naar ons TransIP-account, met de verhuiscode (EPP)
// van de klant. Zelfde TRANSIP_TOKEN als de beschikbaarheidscheck.

const TRANSIP_API = "https://api.transip.nl/v6";

/**
 * Vraagt bij TransIP de overdracht van een domein aan
 * (POST /v6/domains met authCode). Geeft true terug als TransIP de
 * aanvraag accepteert; false bij ontbrekende configuratie of een
 * geweigerde aanvraag (dan volgt handmatige afhandeling via admin).
 */
export async function requestDomainTransfer(
  domain: string,
  authCode: string,
): Promise<boolean> {
  const token = process.env.TRANSIP_TOKEN;
  if (!token) {
    console.warn(`TransIP niet geconfigureerd; overdracht van "${domain}" niet aangevraagd`);
    return false;
  }

  const res = await fetch(`${TRANSIP_API}/domains`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ domainName: domain, authCode }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`TransIP-overdracht voor ${domain} geweigerd (${res.status}): ${body}`);
    return false;
  }
  return true;
}
