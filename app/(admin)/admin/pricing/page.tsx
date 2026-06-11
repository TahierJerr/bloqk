import { PricingForm } from "@/components/admin/pricing-form";
import { getPricingConfig } from "@/lib/pricing-server";

export default async function AdminPricingPage() {
    const pricing = await getPricingConfig();

    return (
        <main className="mx-auto w-full max-w-5xl px-6 py-10">
            <header className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold tracking-tight">Prijzen</h1>
                <p className="text-sm text-muted-foreground">
                    Deze bedragen worden direct gebruikt in het orderformulier en bij
                    Mollie-betalingen. Bedragen in euro&apos;s.
                </p>
            </header>

            <div className="mt-8">
                <PricingForm
                    pricing={{
                        websiteBase: pricing.websiteBase,
                        websiteSplitTotal: pricing.websiteSplitTotal,
                        websiteUpfront: pricing.websiteUpfront,
                        subMonthly: pricing.subMonthly,
                        subYearly: pricing.subYearly,
                        hostingShare: pricing.hostingShare,
                        softwareShare: pricing.softwareShare,
                    }}
                />
            </div>
        </main>
    );
}
