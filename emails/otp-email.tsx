import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Font,
    Tailwind,
} from "@react-email/components";

export type OtpEmailProps = {
    name?: string;
    otpCode: string;
    expiresInMinutes?: number;
};

export function OtpEmail({
    name,
    otpCode = "000000",
    expiresInMinutes = 10,
}: OtpEmailProps) {
    // Split the OTP into two segments for easier scanning (e.g., "123 456")
    const formattedCode = otpCode.length === 6 
        ? `${otpCode.slice(0, 3)} ${otpCode.slice(3)}` 
        : otpCode;

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
                            primary: "#3b52f6", // Your primary oklch brand blue tint
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
                    <Font
                        fontFamily="Comfortaa"
                        fallbackFontFamily="sans-serif"
                        webFont={{
                            url: "https://fonts.gstatic.com/s/comfortaa/v45/1Pt_g8at03m_Pg7XF3g28vX6vU9SInuY5669_bTr.woff2",
                            format: "woff2",
                        }}
                        fontWeight={700}
                        fontStyle="normal"
                    />
                </Head>
                <Preview>Je verificatiecode is {otpCode}</Preview>
                <Body className="bg-[#f4f4f7] font-['Comfortaa',sans-serif] py-12 px-4">
                    <Container className="bg-background mx-auto p-8 max-w-xl rounded-[2rem] border border-solid border-border shadow-sm">
                        
                        {/* Brand Logo Alignment */}
                        <Section className="mb-8">
                            <Text className="inline-block text-4xl font-light tracking-tight text-foreground m-0 select-none font-['Comfortaa',sans-serif]">
                                bloqk
                                <span className="text-primary select-none">.</span>
                            </Text>
                        </Section>

                        {/* Heading Segment */}
                        <Section className="mb-6">
                            <Heading className="text-2xl font-semibold tracking-tight text-foreground m-0 mb-3 font-['Comfortaa',sans-serif]">
                                {name ? `Hallo ${name},` : "Verifieer je account"}
                            </Heading>
                            <Text className="text-sm leading-relaxed text-muted-foreground m-0 font-['Comfortaa',sans-serif]">
                                Gebruik de onderstaande verificatiecode om in te loggen of je aanvraag af te ronden. Deze code is wegens veiligheidsredenen slechts {expiresInMinutes} minuten geldig.
                            </Text>
                        </Section>

                        {/* Large High-Contrast OTP Presentation Card Layout */}
                        <Section className="bg-muted border border-solid border-border rounded-2xl p-8 my-8 text-center select-all">
                            <Text className="text-4xl font-bold tracking-[0.25em] text-primary m-0 font-['Comfortaa',sans-serif]">
                                {formattedCode}
                            </Text>
                        </Section>

                        <Text className="text-xs text-muted-foreground leading-relaxed mb-6 font-['Comfortaa',sans-serif]">
                            Heb je deze code niet zelf aangevraagd? Dan kun je deze e-mail veilig negeren. Iemand heeft mogelijk per ongeluk jouw e-mailadres ingevoerd.
                        </Text>

                        <Hr className="border-t border-solid border-border my-6" />

                        {/* System Footer Info */}
                        <Section>
                            <Text className="text-xs leading-relaxed text-muted-foreground m-0 mb-1 font-['Comfortaa',sans-serif]">
                                Vragen of problemen? Neem contact op via{" "}
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

export default OtpEmail;