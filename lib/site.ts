export const siteConfig = {
  name: "Bloqk",
  // Never hardcode the domain anywhere else,  change it here (or via env) and it
  // propagates to metadata, sitemap, robots and structured data.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://bloqk.nl",
  locale: "nl_NL",
  description:
    "Bloqk is eerlijke boekingssoftware voor kappers, barbiers en stylisten. Geen commissie op je betalingen, EU-gehost en een vaste prijs zonder verrassingen.",
} as const;
