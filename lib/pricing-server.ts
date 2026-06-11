import prismadb from "./prismadb";
import type { Pricing } from "./pricing";

// Haalt de (enige) prijsconfiguratie op; maakt hem aan met de
// standaardwaarden uit het schema als hij nog niet bestaat
export async function getPricingConfig(): Promise<Pricing & { id: string }> {
    const existing = await prismadb.pricingConfig.findFirst();
    if (existing) return existing;
    return prismadb.pricingConfig.create({ data: {} });
}
