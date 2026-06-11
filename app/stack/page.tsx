import type { Metadata } from "next";

import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Stack",
  description:
    "Waar draait Bloqk op? Volledige transparantie over onze techniek: Hetzner, Mollie, Scaleway, Cloudflare, Next.js en .NET. Pragmatisch idealistisch.",
  alternates: { canonical: "/stack" },
  openGraph: {
    url: "/stack",
    title: "Stack | Bloqk",
    description:
      "Volledige transparantie over onze techniek: Hetzner, Mollie, Scaleway, Cloudflare, Next.js en .NET.",
  },
};

const services = [
  {
    flag: "🇩🇪",
    name: "Hetzner",
    role: "Servers & database",
    location: "Falkenstein & Neurenberg, Duitsland",
    why: "Hier draait Bloqk en hier staat je data: je klanten, afspraken en instellingen, in een PostgreSQL-database op fysieke servers in Duitsland, onder Europese wetgeving. Geen Amerikaanse cloud waar onduidelijk is wie meekijkt.",
  },
  {
    flag: "🇳🇱",
    name: "Mollie",
    role: "Betalingen",
    location: "Amsterdam, Nederland",
    why: "Een Nederlandse betaaldienst die we begrijpen en kunnen bellen. Geen Amerikaanse processor die geld vasthoudt of commissie afroomt. Je klant betaalt, jij krijgt het.",
  },
  {
    flag: "🇫🇷",
    name: "Scaleway",
    role: "E-mail",
    location: "Parijs, Frankrijk",
    why: "Verificatiecodes, afspraakbevestigingen en herinneringen lopen via een Europese e-maildienst. Niet via Amerikaanse partijen zoals SendGrid of Mailchimp.",
  },
  {
    flag: "🇺🇸",
    name: "Cloudflare",
    role: "DNS & bescherming",
    location: "Wereldwijd netwerk, Amerikaans bedrijf",
    why: "Eerlijk: Cloudflare is Amerikaans. We gebruiken het alleen voor DNS en bescherming tegen aanvallen, omdat er simpelweg geen Europees alternatief is dat hetzelfde niveau biedt. Je data staat er niet, die blijft bij Hetzner in Duitsland.",
  },
];

const techniques = [
  {
    name: "Next.js",
    what: "De app waar je nu naar kijkt: de website, onboarding en je dashboard. Open source, React-gebaseerd.",
  },
  {
    name: ".NET",
    what: "De motor achter het boeken: afspraken, beschikbaarheid en herinneringen draaien op een aparte, snelle .NET-backend.",
  },
  {
    name: "PostgreSQL",
    what: "De database zelf,  een open standaard, geen lock-in. Jouw data is exporteerbaar en blijft van jou.",
  },
  {
    name: "Prisma",
    what: "De laag tussen Bloqk en de database. Open source en breed gedragen.",
  },
];

const eyebrow =
  "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground";

export default function StackPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav />

      <main className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <p className={eyebrow}>Stack</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Waar je data staat, en waarom.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              De meeste software vertelt je nooit waar je gegevens terechtkomen.
              Wij wel. Dit is precies waar Bloqk op draait,  élk onderdeel, ook
              de keuzes waar we zelf niet honderd procent blij mee zijn.
            </p>
          </div>
        </section>

        {/* Services */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <div className="divide-y divide-border border-t border-border">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="grid gap-4 py-10 sm:grid-cols-[16rem_1fr] sm:gap-10"
                >
                  <div>
                    <div className="flex items-baseline gap-2.5">
                      <span aria-hidden className="text-lg">
                        {service.flag}
                      </span>
                      <h2 className="text-lg font-bold tracking-tight">
                        {service.name}
                      </h2>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {service.role}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {service.location}
                    </p>
                  </div>
                  <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                    {service.why}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Techniek */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <p className={eyebrow}>Onder de motorkap</p>
            <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
              Gebouwd op open standaarden.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Onder de motorkap gebruiken we zoveel mogelijk open source
              software. Dat betekent geen verrassende licentiekosten en geen
              lock-in,  je zit nooit klem bij één leverancier.
            </p>
            <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
              {techniques.map((item) => (
                <div key={item.name}>
                  <h3 className="text-base font-bold">{item.name}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                    {item.what}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pragmatisch idealistisch */}
        <section>
          <div className="mx-auto max-w-5xl px-6 py-24">
            <div className="max-w-2xl">
              <p className={eyebrow}>Onze filosofie</p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Pragmatisch idealistisch.
              </h2>
              <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
                Ons doel is om zo ethisch mogelijk te zijn terwijl onze
                software gewoon goed werkt. Dat noemen we pragmatisch
                idealistisch: waar het kan kiezen we Europees, open source en
                privacyvriendelijk. Waar dat (nog) niet kan, zoals bij DNS,
                kiezen we de beste pragmatische optie en zijn we daar gewoon
                eerlijk over.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                Hetzelfde geldt voor je geld: 0% commissie op boekingen, prijzen
                op de voorkant en je data die altijd van jou blijft. We zijn
                transparant over onze reis, niet alleen het eindpunt. Heb je een
                vraag over waar iets staat? Stel hem gerust.
              </p>
              <div className="mt-8">
                <Button asChild>
                  <a href="mailto:support@bloqk.nl">Stel je vraag</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
