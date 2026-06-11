import {
    Body,
    Button,
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

export type StaffInviteEmailProps = {
    salonName: string;
    inviterName: string;
    inviteUrl: string;
    expiresInDays: number;
};

export function StaffInviteEmail({
    salonName,
    inviterName,
    inviteUrl,
    expiresInDays,
}: StaffInviteEmailProps) {
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
                <Preview>Je bent uitgenodigd voor het team van {salonName}</Preview>
                <Body className="bg-[#f4f4f7] font-['Comfortaa',sans-serif] py-12 px-4">
                    <Container className="bg-background mx-auto p-8 max-w-xl rounded-[2rem] border border-solid border-border shadow-sm">

                        <Section className="mb-6">
                            <Text className="inline-block text-4xl font-light tracking-tight text-foreground m-0 select-none font-['Comfortaa',sans-serif]">
                                bloqk
                                <span className="text-primary select-none">.</span>
                            </Text>
                        </Section>

                        <Section className="mb-6">
                            <Heading className="text-2xl font-semibold tracking-tight text-foreground m-0 mb-3 font-['Comfortaa',sans-serif]">
                                Welkom bij het team van {salonName}
                            </Heading>
                            <Text className="text-sm leading-relaxed text-muted-foreground m-0 font-['Comfortaa',sans-serif]">
                                {inviterName} heeft je uitgenodigd als teamlid van{" "}
                                {salonName} op Bloqk. Maak je account aan via de knop
                                hieronder, dan kun je direct bij de agenda en afspraken.
                            </Text>
                        </Section>

                        <Section className="my-8 text-center">
                            <Button
                                href={inviteUrl}
                                className="bg-primary text-white rounded-full px-8 py-3 text-sm font-medium no-underline font-['Comfortaa',sans-serif]"
                            >
                                Account aanmaken
                            </Button>
                        </Section>

                        <Text className="text-xs text-muted-foreground leading-relaxed mb-6 font-['Comfortaa',sans-serif]">
                            Deze uitnodiging is {expiresInDays} dagen geldig en alleen
                            bedoeld voor dit e-mailadres. Verwacht je deze uitnodiging
                            niet? Dan kun je deze e-mail veilig negeren.
                        </Text>

                        <Hr className="border-t border-solid border-border my-6" />

                        <Section>
                            <Text className="text-xs leading-relaxed text-muted-foreground m-0 mb-1 font-['Comfortaa',sans-serif]">
                                Knop werkt niet? Kopieer deze link:{" "}
                                <a href={inviteUrl} className="text-primary no-underline hover:underline">
                                    {inviteUrl}
                                </a>
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

export default StaffInviteEmail;
