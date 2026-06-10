import createMollieClient from "@mollie/api-client";

// Lazy zodat een ontbrekende key de build niet breekt, alleen de betaalflow
export function getMollieClient() {
    const apiKey = process.env.MOLLIE_API_KEY;
    if (!apiKey) {
        throw new Error("MOLLIE_API_KEY is not set");
    }
    return createMollieClient({ apiKey });
}
