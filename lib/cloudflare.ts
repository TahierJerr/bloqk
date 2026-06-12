// Cloudflare API: zone aanmaken voor een klantdomein en de juiste
// DNS-records zetten. Vereist in .env: CLOUDFLARE_API_TOKEN (met
// Zone:Edit + DNS:Edit) en CLOUDFLARE_ACCOUNT_ID.

import { getDnsRecords } from "./dns";

const CF_API = "https://api.cloudflare.com/client/v4";

type CfResult<T> = {
  success: boolean;
  result: T;
  errors?: { code: number; message: string }[];
};

function cfHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export type CloudflareZone = {
  zoneId: string;
  // De nameservers die Cloudflare aan deze zone heeft toegewezen
  nameServers: string[];
};

/**
 * Maakt (of vindt) de Cloudflare-zone voor een domein en zet de
 * standaard DNS-records. Idempotent: bestaande zones en records
 * worden hergebruikt. Geeft het zone-id en de toegewezen Cloudflare-
 * nameservers terug, of null wanneer Cloudflare niet geconfigureerd is.
 */
export async function createZoneWithDns(
  domain: string,
): Promise<CloudflareZone | null> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!token || !accountId) {
    console.warn(`Cloudflare niet geconfigureerd; zone voor "${domain}" niet aangemaakt`);
    return null;
  }

  type ZoneInfo = { id: string; name_servers?: string[] };

  // Bestaat de zone al?
  const lookup = await fetch(
    `${CF_API}/zones?name=${encodeURIComponent(domain)}`,
    { headers: cfHeaders(token), cache: "no-store" },
  );
  const found = (await lookup.json()) as CfResult<ZoneInfo[]>;
  let zoneInfo: ZoneInfo | undefined = found.success
    ? found.result?.[0]
    : undefined;

  if (!zoneInfo) {
    const created = await fetch(`${CF_API}/zones`, {
      method: "POST",
      headers: cfHeaders(token),
      body: JSON.stringify({
        name: domain,
        account: { id: accountId },
        type: "full",
      }),
    });
    const zone = (await created.json()) as CfResult<ZoneInfo>;
    if (!zone.success) {
      throw new Error(
        `Cloudflare-zone aanmaken mislukt: ${zone.errors?.map((e) => e.message).join(", ")}`,
      );
    }
    zoneInfo = zone.result;
  }
  const zoneId = zoneInfo.id;

  // Standaardrecords zetten; code 81057 = record bestaat al, prima
  for (const record of getDnsRecords()) {
    const res = await fetch(`${CF_API}/zones/${zoneId}/dns_records`, {
      method: "POST",
      headers: cfHeaders(token),
      body: JSON.stringify({
        type: record.type,
        name: record.name === "@" ? domain : `${record.name}.${domain}`,
        content: record.value,
        proxied: true,
        ttl: 1, // automatisch
      }),
    });
    const dns = (await res.json()) as CfResult<unknown>;
    if (!dns.success && !dns.errors?.some((e) => e.code === 81057)) {
      console.error(
        `DNS-record ${record.name} voor ${domain} mislukt:`,
        dns.errors?.map((e) => e.message).join(", "),
      );
    }
  }

  return { zoneId, nameServers: zoneInfo.name_servers ?? [] };
}
