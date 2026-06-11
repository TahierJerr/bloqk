import { OrderForm } from "@/components/order-form/order-form";
import { getPricingConfig } from "@/lib/pricing-server";

export default async function Page() {
    // Prijzen zijn beheerbaar via /admin/pricing; hier opgehaald zodat
    // het formulier altijd de actuele bedragen toont
    const pricing = await getPricingConfig();

    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 py-8 sm:gap-8 sm:py-16">
            <OrderForm
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
        </main>
    );
}
