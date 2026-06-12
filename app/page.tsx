import type { Metadata } from "next";
import Link from "next/link";

import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { siteConfig } from "@/lib/site";
import { getPricingConfig } from "@/lib/pricing-server";
import { formatEuro, splitWebsiteMonthly } from "@/lib/pricing";

export const metadata: Metadata = {
  // Bypass the "%s | Bloqk" template for the home page.
  title: {
    absolute: "Bloqk,  Eerlijke boekingssoftware voor kappers",
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "Bloqk,  Eerlijke boekingssoftware voor kappers",
    description: siteConfig.description,
  },
};

const reasons = [
  {
    title: "0% commissie op boekingen",
    body: "Fresha pakt een deel van elke betaling. Wij niet. Wat je klant betaalt, is van jou,  elke euro. Je betaalt ons een vast bedrag, meer niet.",
  },
  {
    title: "In Europa gehost",
    body: "Je data staat op servers in Duitsland, niet in de VS. AVG van begin tot eind, zonder uitzonderingen of kleine lettertjes.",
  },
  {
    title: "Eerlijke prijs",
    body: "Eén prijs, op de voorkant. Geen tiers, geen “neem contact op voor prijzen”, geen verrassing op je factuur.",
  },
  {
    title: "Eerst voor je telefoon",
    body: "De meeste salonsoftware is een drama op mobiel. Bloqk is eerst voor je telefoon gebouwd, daarna pas voor desktop.",
  },
];

const stack = [
  { flag: "🇩🇪", name: "Hetzner", role: "servers & database" },
  { flag: "🇳🇱", name: "Mollie", role: "betalingen" },
  { flag: "🇫🇷", name: "Scaleway", role: "e-mail" },
  { flag: "🇺🇸", name: "Cloudflare", role: "DNS,  eerlijk: Amerikaans" },
];

const steps = [
  {
    number: "1",
    title: "Vertel over je salon",
    body: "Een paar minuten invullen: je naam, je stijl, je diensten en openingstijden. Of je overlegt liever even,  kan ook.",
  },
  {
    number: "2",
    title: "Wij bouwen je site",
    body: "Binnen 48 uur staat je preview klaar. Niet goed? Dan passen we aan tot het wél klopt. Jij keurt goed.",
  },
  {
    number: "3",
    title: "Live, met boekingen",
    body: "Je klanten boeken online, jij houdt overzicht in je dashboard. En van elke boeking is elke euro voor jou.",
  },
];

const eyebrow =
  "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground";

export default async function HomePage() {
  // Dezelfde prijzen als de checkout, dus nooit verouderde bedragen
  const pricing = await getPricingConfig();
  const monthYear1 = splitWebsiteMonthly(pricing) + pricing.subMonthly;
  const yearOneDeal = pricing.websiteUpfront + pricing.subYearly;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: "Bloqk",
        url: siteConfig.url,
        description: siteConfig.description,
        areaServed: { "@type": "Country", name: "Netherlands" },
        knowsLanguage: "nl",
      },
      {
        "@type": "SoftwareApplication",
        name: "Bloqk",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: siteConfig.description,
        url: siteConfig.url,
        inLanguage: "nl",
        offers: [
          {
            "@type": "Offer",
            name: "Maandelijks",
            price: (monthYear1 / 100).toFixed(2),
            priceCurrency: "EUR",
            description:
              "Website gespreid over 12 maanden plus abonnement; daarna alleen het abonnement per maand.",
          },
          {
            "@type": "Offer",
            name: "Jaarlijks",
            price: (yearOneDeal / 100).toFixed(2),
            priceCurrency: "EUR",
            description:
              "Website in één keer plus jaarabonnement met 2 maanden gratis.",
          },
        ],
      },
    ],
  };

  const maandelijksIncludes = [
    "Complete salonwebsite, door ons gebouwd",
    "Boekingen, klanten en agenda",
    "0% commissie op boekingen",
    `Na jaar 1 nog ${formatEuro(pricing.subMonthly)} per maand`,
    "EU-hosting & dagelijkse back-ups",
  ];

  const jaarlijksIncludes = [
    `Website in één keer: ${formatEuro(pricing.websiteUpfront)}`,
    `Abonnement ${formatEuro(pricing.subYearly)}/jaar,  2 maanden gratis`,
    "0% commissie op boekingen",
    "Je data is en blijft van jou",
    "Updates en support inbegrepen",
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border bg-background py-24 sm:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)",
              backgroundSize: "28px 28px",
              maskImage: "linear-gradient(to bottom, black, transparent 75%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black, transparent 75%)",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <p className={eyebrow}>Voor kappers, barbiers en stylisten</p>
              <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
                Je salon online, zonder verrassingen.
              </h1>
              <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg leading-relaxed text-muted-foreground">
                Wij bouwen je website, je klanten boeken online en jij houdt
                overzicht. 0% commissie op boekingen, elke euro die je klanten
                betalen is voor jou.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Button
                  className="bg-blue-500 hover:bg-blue-600"
                  asChild
                  size="lg"
                >
                  <Link href="/start">Start je aanvraag</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/pricing">Bekijk prijzen</Link>
                </Button>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">
                Website vanaf {formatEuro(pricing.websiteBase)} · abonnement
                vanaf {formatEuro(pricing.subMonthly)}/mnd · geen commissie
              </p>
            </div>

            {/* Product Visual Mockup */}
            <div className="flex-1 w-full max-w-md lg:max-w-none relative">
              <div className="aspect-9/16 lg:aspect-square overflow-hidden rounded-2xl border border-border bg-muted/50 shadow-2xl flex items-center justify-center">
                {/* Replace this div with your actual <Image /> tag of the mobile app */}
                <div className="text-center p-6">
                  <p className="text-4xl font-light tracking-tight select-none">
                    bloqk<span className="text-primary">.</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    [Screenshot mobile dashboard]
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Zo werkt het */}
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <p className={eyebrow}>Zo werkt het</p>
            <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
              Van aanvraag tot live, zonder gedoe.
            </h2>
            <div className="mt-14 grid gap-10 sm:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number}>
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {step.number}
                  </span>
                  <h3 className="mt-4 text-base font-bold">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Bloqk */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <p className={eyebrow}>Waarom Bloqk</p>
            <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
              Eerlijk, van begin tot eind.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              We noemen het pragmatisch idealistisch: zo ethisch mogelijk,
              terwijl de software gewoon goed werkt.
            </p>
            <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2">
              {reasons.map((reason) => (
                <div key={reason.title}>
                  <h3 className="text-base font-bold">{reason.title}</h3>
                  <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                    {reason.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <p className={eyebrow}>Prijzen</p>
            <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
              Je weet precies waar je voor betaalt.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Website plus abonnement, betalen zoals het jou past. Geen
              verborgen tiers, geen commissie.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <p className="text-sm font-semibold">Maandelijks</p>
                  <p className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tracking-tight">
                      {formatEuro(monthYear1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      per maand in jaar 1
                    </span>
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="flex flex-col gap-2.5 text-sm">
                    {maandelijksIncludes.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span aria-hidden className="text-primary">
                          ✓
                        </span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    <Link href="/start">Aan de slag</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <p className="text-sm font-semibold">Jaarlijks, beste deal</p>
                  <p className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tracking-tight">
                      {formatEuro(yearOneDeal)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      eerste jaar, alles erin
                    </span>
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="flex flex-col gap-2.5 text-sm">
                    {jaarlijksIncludes.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span aria-hidden className="text-primary">
                          ✓
                        </span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/pricing">Lees de details</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Tech stack */}
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <p className={eyebrow}>Veiligheid & Hosting</p>
            <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
              Je weet precies waar je data staat.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Europese diensten waar het kan, en eerlijkheid waar het (nog) niet
              kan. Dit is de basis waar Bloqk op draait.
            </p>

            <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2">
              {stack.map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-baseline gap-3 bg-background px-6 py-5"
                >
                  <span aria-hidden className="text-base">
                    {tool.flag}
                  </span>
                  <span className="font-semibold">{tool.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {tool.role}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Je data staat in Duitsland, je betalingen lopen via Nederland en
              je e-mail via Frankrijk. Jouw data is van jou en wordt nooit
              gedeeld met derden.{" "}
              <Link
                href="/stack"
                className="text-foreground underline underline-offset-4 hover:text-primary font-medium"
              >
                Bekijk onze volledige stack.
              </Link>
            </p>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-5xl px-6 py-24 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Klaar om te beginnen?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Geen demo calls, geen sales druk. Doe je aanvraag in een paar
              minuten en binnen 48 uur staat je preview klaar.
            </p>
            <div className="mt-8">
              <Button
                className="bg-blue-500 hover:bg-blue-600"
                asChild
                size="lg"
              >
                <Link href="/start">Start je aanvraag</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
