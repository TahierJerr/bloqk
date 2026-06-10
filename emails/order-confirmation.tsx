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

export type OrderConfirmationEmailProps = {
    name: string;
    salonName: string;
    salonType: string;
    address: string;
    pkg: string;
};

export function OrderConfirmationEmail({
    name,
    salonName,
    salonType,
    address,
    pkg,
}: OrderConfirmationEmailProps) {
    const rows = [
        { label: "Salon", value: salonName },
        { label: "Type", value: salonType },
        { label: "Adres", value: address },
        { label: "Pakket", value: pkg },
    ];

    return (
        <Tailwind
            config={{
                theme: {
                    extend: {
                        colors: {
                            background: "#ffffff",
                            foreground: "#252525",
                            muted: "#f7f7f7",
                            "muted-foreground": "#8d8d8d",
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
                        fontWeight={300}
                        fontStyle="normal"
                    />
                    <Font
                        fontFamily="Comfortaa"
                        fallbackFontFamily="sans-serif"
                        webFont={{
                            url: "https://fonts.gstatic.com/s/comfortaa/v45/1Pt_g8at03m_Pg7XF3g28vX6vU9SInuY5669_bTr.woff2",
                            format: "woff2",
                        }}
                        fontWeight={500}
                        fontStyle="normal"
                    />
                </Head>
                <Preview>Bedankt voor je aanvraag! We hebben je gegevens ontvangen.</Preview>
                <Body className="bg-[#f4f4f7] font-['Comfortaa',sans-serif] py-12 px-4">
                    <Container className="bg-background mx-auto p-8 max-w-xl rounded-[2rem] border border-solid border-border shadow-sm">
                        
                        {/* Enlarged Logo with explicit font declaration layout */}
                        <Section className="mb-8">
                            <Text className="inline-block text-4xl font-light tracking-tight text-foreground m-0 select-none font-['Comfortaa',sans-serif]">
                                bloqk
                                <span className="text-primary select-none">.</span>
                            </Text>
                        </Section>

                        <Section className="bg-[#f5f7ff] rounded-2xl p-6 mb-8 text-center border border-solid border-[#e0e6ff]">
                            <Heading className="text-2xl font-semibold tracking-tight text-foreground m-0 mb-2 font-['Comfortaa',sans-serif]">
                                Bedankt voor je aanvraag, {name}!
                            </Heading>
                            <Text className="text-sm leading-relaxed text-muted-foreground m-0 font-['Comfortaa',sans-serif]">
                                We hebben je aanvraag voor Bloqk ontvangen en nemen binnen 24 uur contact met je op om alles door te nemen.
                            </Text>
                        </Section>

                        <Text className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-3 px-1 font-['Comfortaa',sans-serif]">
                            Gecontroleerde gegevens
                        </Text>
                        <Section className="w-full overflow-hidden rounded-2xl border border-solid border-border mb-8">
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

                        <Hr className="border-t border-solid border-border my-6" />

                        <Section>
                            <Text className="text-xs leading-relaxed text-muted-foreground m-0 mb-1 font-['Comfortaa',sans-serif]">
                                Heb je in de tussentijd een vraag? Mail ons gerust op{" "}
                                <a href="mailto:support@bloqk.nl" className="text-primary no-underline hover:underline font-medium">
                                    support@bloqk.nl
                                </a>.
                            </Text>
                            <Text className="text-xs font-medium text-foreground m-0 font-['Comfortaa',sans-serif]">
                                Team Bloqk
                            </Text>
                        </Section>

                    </Container>
                </Body>
            </Html>
        </Tailwind>
    );
}

export default OrderConfirmationEmail;