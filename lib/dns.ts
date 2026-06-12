// De DNS-records die een klantdomein nodig heeft om naar de
// Bloqk-hosting te wijzen. Eén plek, zodat de klant-UI, het admin-
// paneel en de Cloudflare-automatisering altijd dezelfde records tonen.

export type DnsRecord = {
  type: "CNAME";
  name: string;
  value: string;
};

// Waar klantwebsites naartoe wijzen; overschrijfbaar via .env
const DEFAULT_TARGET = "sites.bloqk.nl";

export function dnsTarget() {
  return process.env.SITE_DNS_TARGET || DEFAULT_TARGET;
}

export function getDnsRecords(): DnsRecord[] {
  const target = dnsTarget();
  return [
    { type: "CNAME", name: "@", value: target },
    { type: "CNAME", name: "www", value: target },
  ];
}
