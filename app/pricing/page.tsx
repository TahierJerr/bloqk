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
import { getPricingConfig } from "@/lib/pricing-server";
import { formatEuro, splitWebsiteMonthly } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Prijzen",
  description:
    "De prijzen van Bloqk: je salonwebsite vanaf €149 en een abonnement per maand of per jaar. Geen commissie op boekingen, geen verborgen tiers.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    url: "/pricing",
    title: "Prijzen | Bloqk",
    description:
      "Je salonwebsite vanaf €149 en een abonnement per maand of per jaar. Geen commissie op boekingen.",
  },
};

const faq = [
  {
    q: "Betaal ik commissie?",
    a: "Nee. Nooit. Wat je klant betaalt, gaat naar jou. Wij verdienen aan je abonnement en de website, niet aan jouw omzet. 0% commissie op boekingen, elke euro is voor jou.",
  },
  {
    q: "Wat als ik stop?",
    a: "Dan stop je. Je data is van jou,  je krijgt een volledige export en we verwijderen de rest. Geen opzegtermijn van een jaar, geen gedoe.",
  },
  {
    q: "Is het AVG-proof?",
    a: "Ja. Je gegevens staan volledig in Europa, op servers van Hetzner in Duitsland. Geen data die ongemerkt naar de VS gaat.",
  },
  {
    q: "Zitten er extra kosten aan?",
    a: "Nee. De prijs die je hier ziet, is de prijs. Geen setup-kosten, geen transactiekosten, geen verrassing op je factuur.",
  },
  {
    q: "Waarom is gespreid betalen iets duurder?",
    a: "Bij gespreid betalen spreid je de website over 12 maanden zonder dat je vooraf veel hoeft te investeren. Dat gemak zit in de prijs. Betaal je in één keer, dan ben je goedkoper uit.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const eyebrow =
  "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground";

export default async function PricingPage() {
  // Bedragen komen uit dezelfde configuratie als de checkout, zodat de
  // site nooit andere prijzen toont dan de klant straks betaalt
  const pricing = await getPricingConfig();
  const monthYear1 = splitWebsiteMonthly(pricing) + pricing.subMonthly;
  const yearOneDeal = pricing.websiteUpfront + pricing.subYearly;

  const plans = [
    {
      name: "Maandelijks",
      price: formatEuro(monthYear1),
      unit: "per maand in jaar 1",
      blurb: `Je website (${formatEuro(pricing.websiteSplitTotal)}) gespreid over 12 maanden + abonnement. Daarna nog ${formatEuro(pricing.subMonthly)} per maand.`,
      cta: "Aan de slag",
      variant: "default" as const,
      includes: [
        "Complete salonwebsite, door ons gebouwd",
        "Boekingen, klanten en agenda",
        "0% commissie op boekingen",
        `Na jaar 1: ${formatEuro(pricing.subMonthly)}/mnd (${formatEuro(pricing.hostingShare)} hosting + ${formatEuro(pricing.softwareShare)} software)`,
        "EU-hosting & dagelijkse back-ups",
        "Updates en support inbegrepen",
      ],
    },
    {
      name: "Jaarlijks — beste deal",
      price: formatEuro(yearOneDeal),
      unit: "eerste jaar (website + abonnement)",
      blurb: `Website in één keer (${formatEuro(pricing.websiteUpfront)}) + jaarabonnement van ${formatEuro(pricing.subYearly)} met 2 maanden gratis.`,
      cta: "Aan de slag",
      variant: "outline" as const,
      includes: [
        "Complete salonwebsite, door ons gebouwd",
        "Boekingen, klanten en agenda",
        "0% commissie op boekingen",
        `2 maanden gratis t.o.v. maandelijks betalen`,
        `Na jaar 1: ${formatEuro(pricing.subYearly)}/jaar`,
        "EU-hosting, updates en support inbegrepen",
      ],
    },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SiteNav />

      <main className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <p className={eyebrow}>Prijzen</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Eerlijke prijzen. Op de voorkant.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Wij bouwen je salonwebsite vanaf {formatEuro(pricing.websiteBase)}{" "}
              en je draait op een vast abonnement. Zonder commissie op je
              boekingen, zonder verborgen tiers en zonder kleine lettertjes.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {plans.map((plan) => (
                <Card key={plan.name}>
                  <CardHeader>
                    <p className="text-sm font-semibold">{plan.name}</p>
                    <p className="mt-3 flex flex-wrap items-baseline gap-1.5">
                      <span className="text-4xl font-bold tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {plan.unit}
                      </span>
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {plan.blurb}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="flex flex-col gap-2.5 text-sm">
                      {plan.includes.map((item) => (
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
                    <Button asChild variant={plan.variant} className="w-full">
                      <Link href="/start">{plan.cta}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <p className="mt-8 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Alle bedragen zijn exclusief btw. Geen setup-kosten, geen
              transactiekosten en 0% commissie op boekingen.
            </p>
          </div>
        </section>

        {/* Maatwerk note */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="rounded-3xl border border-border bg-secondary/40 px-6 py-8 sm:px-10 sm:py-10">
              <h2 className="text-xl font-bold tracking-tight">
                Iets bijzonders nodig? Maatwerk.
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                Heb je specifieke wensen die buiten onze standaard salonwebsite
                vallen? Kies in de aanvraag voor maatwerk, dan maken we samen
                een voorstel dat past, zonder verrassingen achteraf.
              </p>
              <div className="mt-6">
                <Button asChild variant="outline" size="sm">
                  <Link href="/start">Start je aanvraag</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="mx-auto max-w-5xl px-6 py-24">
            <p className={eyebrow}>Veelgestelde vragen</p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Geen verrassingen, ook niet hier.
            </h2>

            <div className="mt-12 max-w-3xl divide-y divide-border border-t border-border">
              {faq.map((item) => (
                <div
                  key={item.q}
                  className="grid gap-2 py-7 sm:grid-cols-[14rem_1fr] sm:gap-8"
                >
                  <h3 className="text-base font-bold">{item.q}</h3>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
