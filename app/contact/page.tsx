import type { Metadata } from "next";

import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Neem contact op met Bloqk. Geen demo calls, geen sales druk,  stuur een berichtje en we reageren binnen 1 werkdag.",
  alternates: { canonical: "/contact" },
  openGraph: {
    url: "/contact",
    title: "Contact | Bloqk",
    description:
      "Geen demo calls, geen sales druk. Stuur een berichtje en we reageren binnen 1 werkdag.",
  },
};

const eyebrow =
  "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground";

export default function ContactPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav />

      <main className="flex-1">
        <section>
          <div className="mx-auto max-w-5xl px-6 py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
              <div className="max-w-md">
                <p className={eyebrow}>Contact</p>
                <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                  Even een berichtje.
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  Geen demo calls, geen sales druk. Stuur een berichtje en we
                  reageren binnen 1 werkdag.
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                  Twijfel je tussen een abonnement en eenmalig, of wil je gewoon
                  weten of Bloqk bij je salon past? Vertel het ons. We denken
                  graag mee, ook als je nog niet zeker bent.
                </p>
              </div>

              <div className="lg:pt-2">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
