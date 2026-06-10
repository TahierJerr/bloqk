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

export type ContactRequestEmailProps = {
    orderId: string;
    salonName: string;
    salonType: string;
    pkg: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null | undefined;
    methodLabel: string;
    adminUrl: string;
};

export function ContactRequestEmail({
    orderId,
    salonName,
    salonType,
    pkg,
    customerName,
    customerEmail,
    customerPhone,
    methodLabel,
    adminUrl,
}: ContactRequestEmailProps) {
    const rows = [
        { label: "Methode", value: methodLabel },
        { label: "Klant", value: customerName },
        { label: "E-mail", value: customerEmail },
        { label: "Telefoon", value: customerPhone || "Niet opgegeven" },
        { label: "Salon", value: `${salonName} (${salonType})` },
        { label: "Pakket", value: pkg },
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
                <Preview>Contactverzoek van {salonName}: {methodLabel}</Preview>
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
                                        📞 Contactverzoek
                                    </Heading>
                                </Column>
                                <Column className="text-right">
                                    <Text className="inline-block bg-muted px-3 py-1 text-xs font-medium text-muted-foreground rounded-full m-0 border border-solid border-border font-['Comfortaa',sans-serif]">
                                        #{orderId}
                                    </Text>
                                </Column>
                            </Row>
                            <Text className="text-sm leading-relaxed text-muted-foreground m-0 mt-2 font-['Comfortaa',sans-serif]">
                                De klant wil overleggen over de aanvraag. Afgesproken:
                                reactie binnen 24 uur.
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

                        <Section className="my-6">
                            <Text className="text-sm m-0 font-['Comfortaa',sans-serif]">
                                <a
                                    href={adminUrl}
                                    className="text-primary font-medium no-underline hover:underline"
                                >
                                    Bekijk de aanvraag in het admin-dashboard →
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

export default ContactRequestEmail;
