// Domeinsuggesties op basis van de salonnaam + beschikbaarheidscheck via
// de TransIP REST API (GET /v6/domain-availability/{domainName}).
// Zet TRANSIP_TOKEN in je .env (een access token uit het TransIP
// controlepaneel); zonder token tonen we suggesties zonder check.

export type DomainSuggestion = {
    domain: string;
    // "free" = bevestigd vrij bij TransIP; "unknown" = niet gecheckt
    status: "free" | "unknown";
};

const TRANSIP_API = "https://api.transip.nl/v6";

function normalize(name: string) {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // accenten weg (café -> cafe)
        .toLowerCase();
}

function validLabel(label: string) {
    return /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])$/.test(label);
}

/**
 * Genereert kandidaat-domeinnamen (.nl) uit de salonnaam:
 * - exacte slug (lowercase, zonder spaties/leestekens), met en zonder koppeltekens
 * - zonder vulwoorden als "bv"
 * - gangbare voorvoegsels (mijn-, de-) en achtervoegsels (-salon, -online,
 *   -studio, -nl, -shop, -group, -webshop)
 * - initialen bij meerdere woorden
 */
export function generateDomainCandidates(salonName: string): string[] {
    const words = normalize(salonName)
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 0 && !["bv", "vof"].includes(word));

    if (words.length === 0) return [];

    const joined = words.join("");
    const hyphen = words.join("-");
    const hasSalonWord = words.some((word) =>
        ["salon", "kapsalon", "barbershop", "studio"].includes(word)
    );
    const startsWithArticle = /^(de|het|mijn)$/.test(words[0] ?? "");

    const labels: string[] = [
        joined,
        hyphen,
        ...(hasSalonWord ? [] : [`${joined}salon`, `${hyphen}-salon`]),
        ...(startsWithArticle ? [] : [`mijn-${hyphen}`, `de-${hyphen}`]),
        `${hyphen}-online`,
        ...(hasSalonWord ? [] : [`${hyphen}-studio`]),
        `${hyphen}-nl`,
        `${hyphen}-shop`,
        `${hyphen}-group`,
        `${hyphen}-webshop`,
    ];

    // Initialen bij meerwoordige namen (bijv. "Studio Knip" -> sksalon)
    if (words.length >= 2) {
        const initials = words.map((word) => word[0] ?? "").join("");
        labels.push(`${initials}salon`, `${initials}-kappers`);
    }

    const seen = new Set<string>();
    const candidates: string[] = [];
    for (const label of labels) {
        if (label.length < 3 || label.length > 63) continue;
        if (!validLabel(label)) continue;
        if (seen.has(label)) continue;
        seen.add(label);
        candidates.push(`${label}.nl`);
    }
    return candidates;
}

async function checkSingle(
    domain: string,
    token: string
): Promise<DomainSuggestion | null> {
    try {
        const res = await fetch(
            `${TRANSIP_API}/domain-availability/${encodeURIComponent(domain)}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                // Beschikbaarheid is momentopname; niet cachen
                cache: "no-store",
            }
        );
        if (!res.ok) return null;
        const data = (await res.json()) as {
            availability?: { status?: string };
        };
        // Statussen: free | notfree | unavailable | inyouraccount |
        // internalpull | internalpush — alleen "free" is interessant
        return data.availability?.status === "free"
            ? { domain, status: "free" }
            : null;
    } catch {
        return null;
    }
}

/**
 * Checkt kandidaten bij TransIP en geeft maximaal `max` suggesties terug,
 * vrije domeinen eerst. Zonder TRANSIP_TOKEN (of als de API faalt) komen
 * de eerste kandidaten terug als "unknown".
 */
export async function suggestAvailableDomains(
    salonName: string,
    max = 9
): Promise<DomainSuggestion[]> {
    const candidates = generateDomainCandidates(salonName);
    if (candidates.length === 0) return [];

    const token = process.env.TRANSIP_TOKEN;
    if (!token) {
        return candidates.slice(0, max).map((domain) => ({
            domain,
            status: "unknown" as const,
        }));
    }

    const results = await Promise.all(
        candidates.map((domain) => checkSingle(domain, token))
    );
    const free = results.filter(
        (result): result is DomainSuggestion => result !== null
    );

    if (free.length >= max) return free.slice(0, max);

    // Te weinig bevestigd vrij: aanvullen met ongecheckte kandidaten
    const freeSet = new Set(free.map((suggestion) => suggestion.domain));
    const fillers = candidates
        .filter((domain) => !freeSet.has(domain))
        .slice(0, max - free.length)
        .map((domain) => ({ domain, status: "unknown" as const }));
    return [...free, ...fillers];
}
