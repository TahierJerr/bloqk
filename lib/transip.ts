// Domeinoverdracht en nameserverbeheer bij TransIP. Zelfde
// TRANSIP_TOKEN als de beschikbaarheidscheck.

const TRANSIP_API = "https://api.transip.nl/v6";

function transipHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Vraagt bij TransIP de overdracht van een domein aan
 * (POST /v6/domains met authCode). De Cloudflare-nameservers gaan mee
 * in de aanvraag, zodat ze direct bij afronding van de overdracht
 * actief zijn. Geeft true terug als TransIP de aanvraag accepteert.
 */
export async function requestDomainTransfer(
  domain: string,
  authCode: string,
  nameservers: string[] = [],
): Promise<boolean> {
  const token = process.env.TRANSIP_TOKEN;
  if (!token) {
    console.warn(`TransIP niet geconfigureerd; overdracht van "${domain}" niet aangevraagd`);
    return false;
  }

  const res = await fetch(`${TRANSIP_API}/domains`, {
    method: "POST",
    headers: transipHeaders(token),
    body: JSON.stringify({
      domainName: domain,
      authCode,
      ...(nameservers.length > 0
        ? { nameservers: nameservers.map((hostname) => ({ hostname })) }
        : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`TransIP-overdracht voor ${domain} geweigerd (${res.status}): ${body}`);
    return false;
  }
  return true;
}

/**
 * Zet de nameservers van een domein dat al in ons TransIP-account zit
 * (PUT /v6/domains/{domain}/nameservers). Fallback voor wanneer de
 * overdracht al gelukt is of het domein al van ons was.
 */
export async function setNameservers(
  domain: string,
  nameservers: string[],
): Promise<boolean> {
  const token = process.env.TRANSIP_TOKEN;
  if (!token || nameservers.length === 0) return false;

  const res = await fetch(
    `${TRANSIP_API}/domains/${encodeURIComponent(domain)}/nameservers`,
    {
      method: "PUT",
      headers: transipHeaders(token),
      body: JSON.stringify({
        nameservers: nameservers.map((hostname) => ({ hostname })),
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`Nameservers voor ${domain} niet gezet (${res.status}): ${body}`);
    return false;
  }
  return true;
}
