import type { Metadata } from "next";

import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Stack",
  description:
    "Waar staat je data? Bloqk is volledig transparant over de techniek: Mollie, Hetzner in Duitsland, Brevo en open source. AVG van begin tot eind.",
  alternates: { canonical: "/stack" },
  openGraph: {
    url: "/stack",
    title: "Stack | Bloqk",
    description:
      "Waar staat je data? Bloqk is volledig transparant over de techniek: Mollie, Hetzner, Brevo en open source.",
  },
};

const services = [
  {
    flag: "🇳🇱",
    name: "Mollie",
    role: "Betalingen",
    location: "Amsterdam, Nederland",
    why: "Een Nederlandse betaaldienst die we begrijpen en kunnen bellen. Geen Amerikaanse processor die geld vasthoudt of commissie afroomt. Je klant betaalt, jij krijgt het.",
  },
  {
    flag: "🇩🇪",
    name: "Hetzner",
    role: "Hosting & database",
    location: "Falkenstein & Neurenberg, Duitsland",
    why: "Hier staat je data. Op fysieke servers in Duitsland, onder Europese wetgeving. Geen Amerikaanse cloud waar onduidelijk is wie meekijkt.",
  },
  {
    flag: "🇫🇷",
    name: "Brevo",
    role: "E-mail",
    location: "Parijs, Frankrijk",
    why: "Afspraakbevestigingen en herinneringen lopen via een Europese e-maildienst. Niet via Amerikaanse partijen zoals SendGrid of Mailchimp.",
  },
  {
    flag: "🇳🇱",
    name: "Cloud86",
    role: "Kapper-websites & domeinen",
    location: "Nederland",
    why: "Voor salons die ook een website willen. Nederlandse hosting voor je domein, e-mail en website,  netjes naast je Bloqk-account.",
  },
];

const openSource = [
  {
    name: "Next.js",
    what: "Het framework waarop Bloqk draait.",
  },
  {
    name: "Prisma",
    what: "De laag tussen Bloqk en je database.",
  },
  {
    name: "PostgreSQL",
    what: "De database zelf,  een open standaard, geen lock-in.",
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
              Wij wel. Dit is precies waar Bloqk op draait en waarom we elke
              keuze gemaakt hebben.
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

        {/* Open source */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <p className={eyebrow}>Open source</p>
            <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
              Gebouwd op open standaarden.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Onder de motorkap gebruiken we open source software. Dat betekent
              geen verrassende licentiekosten en geen lock-in, je zit nooit klem
              bij één leverancier.
            </p>
            <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-3">
              {openSource.map((item) => (
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

        {/* Honest note */}
        <section>
          <div className="mx-auto max-w-5xl px-6 py-24">
            <div className="max-w-2xl">
              <p className={eyebrow}>Eerlijk gezegd</p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                We zijn er nog niet helemaal.
              </h2>
              <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
                Eerlijk is eerlijk: nog niet alles draait 100% in Europa. In
                deze fase hosten we de app-laag nog via Vercel, een Amerikaans
                bedrijf. Je gegevens, klanten, afspraken, betalingen, staan wél
                in Europa, op Hetzner in Duitsland. Aan de app-laag werken we,
                want we willen daar ook naar een volledig Europese oplossing.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                We zijn transparant over onze reis, niet alleen het eindpunt.
                Heb je een vraag over waar iets staat? Stel hem gerust.
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
