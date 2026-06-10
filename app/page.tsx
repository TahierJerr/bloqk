import type { Metadata } from "next";
import Link from "next/link";

import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";

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
                    name: "Abonnement",
                    price: "29",
                    priceCurrency: "EUR",
                    description: "Vast bedrag per maand, maandelijks opzegbaar.",
                },
                {
                    "@type": "Offer",
                    name: "Eenmalig",
                    price: "299",
                    priceCurrency: "EUR",
                    description: "Eenmalige aankoop plus €9/maand hosting.",
                },
            ],
        },
    ],
};

const reasons = [
    {
        title: "Geen commissie",
        body: "Fresha pakt een deel van elke betaling. Wij niet. Wat je klant betaalt, is van jou. Je betaalt ons een vast bedrag, meer niet.",
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
    { flag: "🇳🇱", name: "Mollie", role: "betalingen" },
    { flag: "🇩🇪", name: "Hetzner", role: "hosting & database" },
    { flag: "🇫🇷", name: "Brevo", role: "e-mail" },
    { flag: "🇳🇱", name: "Cloud86", role: "kapper-websites & domeinen" },
];

const abonnementIncludes = [
    "Alle functies, geen uitzonderingen",
    "Geen commissie op betalingen",
    "EU-hosting & dagelijkse back-ups",
    "Updates en support inbegrepen",
    "Maandelijks opzegbaar",
];

const eenmaligIncludes = [
    "Je koopt de software één keer",
    "€9/maand voor hosting & onderhoud",
    "Geen commissie op betalingen",
    "Je data is en blijft van jou",
    "Updates inbegrepen",
];

const eyebrow =
    "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground";

export default function HomePage() {
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
                            maskImage:
                                "linear-gradient(to bottom, black, transparent 75%)",
                            WebkitMaskImage:
                                "linear-gradient(to bottom, black, transparent 75%)",
                        }}
                    />
                    <div className="relative mx-auto max-w-7xl px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left">
                            <p className={eyebrow}>Voor kappers, barbiers en stylisten</p>
                            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
                                Boekingssoftware zonder verrassingen.
                            </h1>
                            <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg leading-relaxed text-muted-foreground">
                                Bloqk regelt je afspraken, je klanten en je agenda. Geen
                                commissie op je betalingen, geen kleine lettertjes. Gewoon
                                software die werkt.
                            </p>
                            <div className="mt-9 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                                <Button className="bg-blue-500 hover:bg-blue-600" asChild size="lg">
                                    <Link href="/start">Start je gratis proefperiode</Link>
                                </Button>
                                <Button asChild size="lg" variant="outline">
                                    <Link href="/pricing">Bekijk prijzen</Link>
                                </Button>
                            </div>
                        </div>
                        
                        {/* Product Visual Mockup */}
                        <div className="flex-1 w-full max-w-md lg:max-w-none relative">
                            <div className="aspect-9/16 lg:aspect-square overflow-hidden rounded-2xl border border-border bg-muted/50 shadow-2xl flex items-center justify-center">
                                {/* Replace this div with your actual <Image /> tag of the mobile app */}
                                <div className="text-center p-6">
                                    <p className="text-muted-foreground font-medium">✨ [Screenshot Mobile Dashboard] ✨</p>
                                    <p className="text-xs text-muted-foreground mt-2">Plaats hier een afbeelding van de app</p>
                                </div>
                            </div>
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

                {/* Social Proof / Testimonial */}
                <section className="bg-muted/30 border-b border-border">
                    <div className="mx-auto max-w-5xl px-6 py-24 text-center">
                        <div className="inline-flex items-center gap-1 text-amber-500 mb-6">
                            {"★★★★★".split("").map((star, i) => (
                                <span key={i}>{star}</span>
                            ))}
                        </div>
                        <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed text-foreground max-w-3xl mx-auto">
                            &quot;Sinds we zijn overgestapt op Bloqk betalen we honderden euro&apos;s per maand minder aan commissies. Het systeem is supersnel op mijn telefoon.&quot;
                        </blockquote>
                        <p className="mt-6 font-semibold text-sm">— Naam Kapper, Eigenaar van Salon X</p>
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
                            Twee manieren. Kies wat bij je past. Geen verborgen tiers,
                            geen commissie.
                        </p>

                        <div className="mt-12 grid gap-6 md:grid-cols-2">
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <p className="text-sm font-semibold">Abonnement</p>
                                    <p className="mt-3 flex items-baseline gap-1.5">
                                        <span className="text-4xl font-bold tracking-tight">
                                            €29
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            per maand
                                        </span>
                                    </p>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <ul className="flex flex-col gap-2.5 text-sm">
                                        {abonnementIncludes.map((item) => (
                                            <li key={item} className="flex gap-2.5">
                                                <span
                                                    aria-hidden
                                                    className="text-primary"
                                                >
                                                    ✓
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {item}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full bg-blue-500 hover:bg-blue-600">
                                        <Link href="/start">Kies Abonnement</Link>
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader>
                                    <p className="text-sm font-semibold">Eenmalig</p>
                                    <p className="mt-3 flex items-baseline gap-1.5">
                                        <span className="text-4xl font-bold tracking-tight">
                                            €299
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            + €9/maand hosting
                                        </span>
                                    </p>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <ul className="flex flex-col gap-2.5 text-sm">
                                        {eenmaligIncludes.map((item) => (
                                            <li key={item} className="flex gap-2.5">
                                                <span
                                                    aria-hidden
                                                    className="text-primary"
                                                >
                                                    ✓
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {item}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full"
                                    >
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
                            Geen verborgen Amerikaanse diensten. Dit is de solide basis waar Bloqk op draait.
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
                            Bloqk is gebouwd op de meest betrouwbare en veilige infrastructuur van Europa. Jouw data is van jou, is beveiligd volgens de hoogste standaarden, en wordt nooit gedeeld met derden.{" "}
                            <Link
                                href="/stack"
                                className="text-foreground underline underline-offset-4 hover:text-primary font-medium"
                            >
                                Lees waarom we deze keuzes maken.
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
                            Geen demo calls, geen sales druk. Vraag direct toegang aan en we
                            regelen het binnen 1 werkdag voor je.
                        </p>
                        <div className="mt-8">
                            <Button className="bg-blue-500 hover:bg-blue-600" asChild size="lg">
                                <Link href="/start">Vraag toegang aan</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}