// Stapconfiguratie en keuzeopties voor het orderformulier.

import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  CalendarClock,
  Flower2,
  Gem,
  Hammer,
  Hand,
  PenTool,
  Scissors,
  Sparkles,
  Wand2,
} from "lucide-react";
import type {
  Billing,
  OrderFormValues,
  Package,
  SalonType,
} from "@/lib/order-schema";
import { formatEuro, splitWebsiteMonthly, type Pricing } from "@/lib/pricing";

// 7 form steps (indices 0-6); the summary is the last one. The progress bar
// shows one extra step because the account step (auth) precedes the form.
export const TOTAL_STEPS = 7;
export const SUMMARY_STEP = 6;

export const STEP_META: { title: string; subtitle: string }[] = [
  { title: "Wat voor salon heb je?", subtitle: "Kies wat het beste past." },
  {
    title: "Hoe heet je salon?",
    subtitle: "Zo verschijnt je naam straks in Bloqk.",
  },
  {
    title: "Heb je al een website?",
    subtitle: "Koppel je eigen domein of claim een nieuwe.",
  },
  {
    title: "Waar zit je salon?",
    subtitle: "We zoeken je adres op in de database.",
  },
  {
    title: "Wie bouwt je website?",
    subtitle: "Wij bouwen hem voor je, of we maken iets volledig op maat.",
  },
  {
    title: "Hoe wil je betalen?",
    subtitle: "Het abonnement regelt je dashboard en online boekingen.",
  },
  {
    title: "Klopt alles?",
    subtitle: "Controleer je gegevens en verstuur je aanvraag.",
  },
];

// Velden die per stap gevalideerd worden voordat je verder mag
export const STEP_FIELDS: Record<number, (keyof OrderFormValues)[]> = {
  0: ["salonType"],
  1: ["salonName"],
  2: ["hasDomain", "customDomain"],
  3: ["address"],
  4: ["package"],
  5: ["billing"],
};

export const SALON_TYPE_ICONS: Record<SalonType, LucideIcon> = {
  "Kapsalons / barbershops": Scissors,
  "Nagelstudio's": Hand,
  Schoonheidssalons: Sparkles,
  Tattooshops: PenTool,
  "Piercingstudio's": Gem,
  Massagesalons: Flower2,
};

export function getPackageOptions(pricing: Pricing): {
  value: Package;
  description: string;
  icon: LucideIcon;
}[] {
  return [
    {
      value: "Wij bouwen het",
      description: `Wij bouwen je complete salonwebsite, vanaf ${formatEuro(pricing.websiteBase)}.`,
      icon: Hammer,
    },
    {
      value: "Maatwerk",
      description:
        "Iets bijzonders in je hoofd? We maken een voorstel op maat.",
      icon: Wand2,
    },
  ];
}

export function getBillingOptions(pricing: Pricing): {
  value: Billing;
  label: string;
  description: string;
  icon: LucideIcon;
}[] {
  const splitPerMonth = splitWebsiteMonthly(pricing) + pricing.subMonthly;
  return [
    {
      value: "monthly",
      label: "Maandelijks",
      description: `${formatEuro(splitPerMonth)}/mnd in jaar 1 (website gespreid + abonnement), daarna ${formatEuro(pricing.subMonthly)}/mnd.`,
      icon: CalendarClock,
    },
    {
      value: "yearly",
      label: "Jaarlijks, beste deal",
      description: `Website in één keer (${formatEuro(pricing.websiteUpfront)}) + ${formatEuro(pricing.subYearly)}/jaar. Dat zijn 2 maanden gratis.`,
      icon: BadgePercent,
    },
  ];
}
