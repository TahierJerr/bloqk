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

export const metadata: Metadata = {
  title: "Prijzen",
  description:
    "De prijzen van Bloqk: €29 per maand of eenmalig €299. Geen commissie, geen verborgen tiers. Je weet precies waar je voor betaalt.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    url: "/pricing",
    title: "Prijzen | Bloqk",
    description:
      "De prijzen van Bloqk: €29 per maand of eenmalig €299. Geen commissie, geen verborgen tiers.",
  },
};

const plans = [
  {
    name: "Abonnement",
    price: "€29",
    unit: "per maand",
    blurb: "Vast bedrag per maand. Maandelijks opzegbaar.",
    cta: "Aan de slag",
    variant: "default" as const,
    includes: [
      "Boekingen, klanten en agenda",
      "Onbeperkt aantal afspraken",
      "Geen commissie op betalingen",
      "EU-hosting & dagelijkse back-ups",
      "Updates en support inbegrepen",
      "Maandelijks opzegbaar",
    ],
  },
  {
    name: "Eenmalig",
    price: "€299",
    unit: "eenmalig + €9/maand hosting",
    blurb: "Je koopt de software één keer. Daarna alleen hosting.",
    cta: "Aan de slag",
    variant: "outline" as const,
    includes: [
      "Boekingen, klanten en agenda",
      "Onbeperkt aantal afspraken",
      "Geen commissie op betalingen",
      "€9/maand voor hosting & onderhoud",
      "Updates inbegrepen",
      "Je data is en blijft van jou",
    ],
  },
];

const faq = [
  {
    q: "Betaal ik commissie?",
    a: "Nee. Nooit. Wat je klant betaalt, gaat naar jou. Wij verdienen aan je abonnement of de eenmalige aankoop, niet aan jouw omzet.",
  },
  {
    q: "Wat als ik stop?",
    a: "Dan stop je. Je data is van jou,  je krijgt een volledige export en we verwijderen de rest. Geen opzegtermijn van een jaar, geen gedoe.",
  },
  {
    q: "Is het AVG-proof?",
    a: "Ja. Bloqk is volledig in Europa gehost, op servers in Duitsland en Nederland. Geen data die ongemerkt naar de VS gaat.",
  },
  {
    q: "Zitten er extra kosten aan?",
    a: "Nee. De prijs die je hier ziet, is de prijs. Geen setup-kosten, geen transactiekosten, geen verrassing op je factuur.",
  },
  {
    q: "Kan ik later wisselen?",
    a: "Ja. Begin met een abonnement en koop later eenmalig af, of andersom. Stuur ons een bericht en we regelen het.",
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

export default function PricingPage() {
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
              Twee manieren om Bloqk te gebruiken. Allebei zonder commissie,
              zonder verborgen tiers en zonder kleine lettertjes. Je weet
              precies waar je voor betaalt.
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
              transactiekosten.
            </p>
          </div>
        </section>

        {/* Website note */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="rounded-3xl border border-border bg-secondary/40 px-6 py-8 sm:px-10 sm:py-10">
              <h2 className="text-xl font-bold tracking-tight">
                We bouwen ook je website.
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                Nog geen fatsoenlijke website voor je salon? Wij maken er een
                die past bij Bloqk, met je domein, je e-mail en online boeken
                erin. Vraag ernaar.
              </p>
              <div className="mt-6">
                <Button asChild variant="outline" size="sm">
                  <a href="mailto:support@bloqk.nl">Vraag ernaar</a>
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
