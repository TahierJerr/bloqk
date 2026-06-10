import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Row,
    Column,
    Section,
    Text,
    Font,
    Tailwind,
} from "@react-email/components";

export type WizardCompleteEmailProps = {
    orderId: string;
    salonName: string;
    salonType: string;
    pkg: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null | undefined;
    hasLogo: boolean;
    photoCount: number;
    colors: { primary: string; secondary: string; accent: string };
    openingHours: { day: string; value: string }[];
    services: { name: string; value: string }[];
    extraInfo?: string | null;
    adminUrl: string;
};

export function WizardCompleteEmail({
    orderId,
    salonName,
    salonType,
    pkg,
    customerName,
    customerEmail,
    customerPhone,
    hasLogo,
    photoCount,
    colors,
    openingHours,
    services,
    extraInfo,
    adminUrl,
}: WizardCompleteEmailProps) {
    const rows = [
        { label: "Klant", value: `${customerName} — ${customerEmail}${customerPhone ? ` — ${customerPhone}` : ""}` },
        { label: "Salon", value: `${salonName} (${salonType})` },
        { label: "Pakket", value: pkg },
        { label: "Logo", value: hasLogo ? "Geüpload" : "Geen — tekstvariant maken" },
        { label: "Foto's", value: `${photoCount}` },
    ];

    const swatches = [
        { label: "Hoofdkleur", color: colors.primary },
        { label: "Tweede kleur", color: colors.secondary },
        { label: "Achtergrond", color: colors.accent },
    ];

    return (
        <Tailwind
            config={{
                theme: {
                    extend: {
                        colors: {
                            background: "#ffffff",
                            foreground: "#0d0d0d",
                            muted: "#f7f7f7",
                            "muted-foreground": "#707070",
                            border: "#ebebeb",
                            primary: "#3b52f6",
                        },
                    },
                },
            }}
        >
            <Html lang="nl">
                <Head>
                    <Font
                        fontFamily="Comfortaa"
                        fallbackFontFamily="sans-serif"
                        webFont={{
                            url: "https://fonts.gstatic.com/s/comfortaa/v45/1Pt_g8at03m_Pg7XF3g28vX6vU9SInuY5669_bTr.woff2",
                            format: "woff2",
                        }}
                        fontWeight={400}
                        fontStyle="normal"
                    />
                    <Font
                        fontFamily="Comfortaa"
                        fallbackFontFamily="sans-serif"
                        webFont={{
                            url: "https://fonts.gstatic.com/s/comfortaa/v45/1Pt_g8at03m_Pg7XF3g28vX6vU9SInuY5669_bTr.woff2",
                            format: "woff2",
                        }}
                        fontWeight={600}
                        fontStyle="normal"
                    />
                </Head>
                <Preview>Wizard ingevuld voor {salonName} — tijd om te bouwen</Preview>
                <Body className="bg-[#f4f4f7] font-['Comfortaa',sans-serif] py-12 px-4">
                    <Container className="bg-background mx-auto p-8 max-w-xl rounded-[2rem] border border-solid border-border shadow-sm">

                        <Section className="mb-6">
                            <Text className="inline-block text-4xl font-light tracking-tight text-foreground m-0 select-none font-['Comfortaa',sans-serif]">
                                bloqk
                                <span className="text-primary select-none">.</span>
                            </Text>
                        </Section>

                        <Section className="mb-6">
                            <Row className="flex items-center justify-between w-full">
                                <Column>
                                    <Heading className="text-2xl font-semibold tracking-tight text-foreground m-0 font-['Comfortaa',sans-serif]">
                                        🚀 Wizard ingevuld
                                    </Heading>
                                </Column>
                                <Column className="text-right">
                                    <Text className="inline-block bg-muted px-3 py-1 text-xs font-medium text-muted-foreground rounded-full m-0 border border-solid border-border font-['Comfortaa',sans-serif]">
                                        #{orderId}
                                    </Text>
                                </Column>
                            </Row>
                            <Text className="text-sm leading-relaxed text-muted-foreground m-0 mt-2 font-['Comfortaa',sans-serif]">
                                De klant heeft de onboarding-wizard afgerond. Afgesproken:
                                preview binnen 48 uur.
                            </Text>
                        </Section>

                        <Hr className="border-t border-solid border-border my-4" />

                        <Section className="w-full overflow-hidden rounded-2xl border border-solid border-border my-6">
                            {rows.map((row, index) => (
                                <Row
                                    key={row.label}
                                    className={`flex items-start p-4 bg-background ${index !== 0 ? "border-t border-solid border-border" : ""}`}
                                >
                                    <Column className="w-24 shrink-0">
                                        <Text className="text-sm text-muted-foreground m-0 font-normal font-['Comfortaa',sans-serif]">
                                            {row.label}
                                        </Text>
                                    </Column>
                                    <Column className="flex-1">
                                        <Text className="text-sm font-medium text-foreground m-0 wrap-break-word font-['Comfortaa',sans-serif]">
                                            {row.value}
                                        </Text>
                                    </Column>
                                </Row>
                            ))}
                        </Section>

                        {/* Kleuren */}
                        <Section className="my-6">
                            <Heading
                                as="h3"
                                className="text-sm font-semibold tracking-tight text-foreground m-0 mb-3 font-['Comfortaa',sans-serif]"
                            >
                                Kleuren
                            </Heading>
                            <Row>
                                {swatches.map((swatch) => (
                                    <Column key={swatch.label} className="pr-4">
                                        <Text className="m-0 text-sm font-['Comfortaa',sans-serif]">
                                            <span
                                                className="inline-block w-3 h-3 rounded-full border border-solid border-border mr-2 align-middle"
                                                style={{ backgroundColor: swatch.color }}
                                            />
                                            <span className="text-muted-foreground">{swatch.label}: </span>
                                            <span className="font-medium text-foreground">{swatch.color}</span>
                                        </Text>
                                    </Column>
                                ))}
                            </Row>
                        </Section>

                        {/* Openingstijden */}
                        <Section className="w-full overflow-hidden rounded-2xl border border-solid border-border my-6">
                            <Row className="flex items-start p-4 bg-muted">
                                <Column>
                                    <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground m-0 font-['Comfortaa',sans-serif]">
                                        Openingstijden
                                    </Text>
                                </Column>
                            </Row>
                            {openingHours.map((hour) => (
                                <Row
                                    key={hour.day}
                                    className="flex items-start p-4 bg-background border-t border-solid border-border"
                                >
                                    <Column className="w-24 shrink-0">
                                        <Text className="text-sm text-muted-foreground m-0 font-normal font-['Comfortaa',sans-serif]">
                                            {hour.day}
                                        </Text>
                                    </Column>
                                    <Column className="flex-1">
                                        <Text className="text-sm font-medium text-foreground m-0 font-['Comfortaa',sans-serif]">
                                            {hour.value}
                                        </Text>
                                    </Column>
                                </Row>
                            ))}
                        </Section>

                        {/* Diensten */}
                        <Section className="w-full overflow-hidden rounded-2xl border border-solid border-border my-6">
                            <Row className="flex items-start p-4 bg-muted">
                                <Column>
                                    <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground m-0 font-['Comfortaa',sans-serif]">
                                        Diensten ({services.length})
                                    </Text>
                                </Column>
                            </Row>
                            {services.map((service, index) => (
                                <Row
                                    key={`${service.name}-${index}`}
                                    className="flex items-start p-4 bg-background border-t border-solid border-border"
                                >
                                    <Column className="flex-1">
                                        <Text className="text-sm font-medium text-foreground m-0 font-['Comfortaa',sans-serif]">
                                            {service.name}
                                        </Text>
                                    </Column>
                                    <Column className="text-right shrink-0">
                                        <Text className="text-sm text-muted-foreground m-0 font-['Comfortaa',sans-serif]">
                                            {service.value}
                                        </Text>
                                    </Column>
                                </Row>
                            ))}
                        </Section>

                        {/* Extra info */}
                        {extraInfo ? (
                            <Section className="bg-muted border border-solid border-border rounded-2xl p-5 my-6">
                                <Heading
                                    as="h3"
                                    className="text-sm font-semibold tracking-tight text-foreground m-0 mb-2 font-['Comfortaa',sans-serif]"
                                >
                                    Extra info / wensen
                                </Heading>
                                <Text className="text-sm leading-relaxed text-foreground m-0 whitespace-pre-wrap font-['Comfortaa',sans-serif]">
                                    {extraInfo}
                                </Text>
                            </Section>
                        ) : null}

                        <Section className="my-6">
                            <Text className="text-sm m-0 font-['Comfortaa',sans-serif]">
                                <a
                                    href={adminUrl}
                                    className="text-primary font-medium no-underline hover:underline"
                                >
                                    Bekijk alles (incl. logo en foto&apos;s) in het admin-dashboard →
                                </a>
                            </Text>
                        </Section>

                        <Hr className="border-t border-solid border-border my-4" />

                        <Section>
                            <Text className="text-xs text-muted-foreground m-0 font-['Comfortaa',sans-serif]">
                                Dit is een geautomatiseerd bericht verstuurd vanuit het Bloqk platform.
                            </Text>
                        </Section>

                    </Container>
                </Body>
            </Html>
        </Tailwind>
    );
}

export default WizardCompleteEmail;
