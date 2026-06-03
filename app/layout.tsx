import type { Metadata, Viewport } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/lib/site";
import { Toaster } from "@/components/ui/sonner";

const comfortaa = Comfortaa({
    subsets: ["latin"],
    weight: ["300", "400", "700"], // pas aan op wat je gebruikt
    variable: "--font-comfortaa",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: "Bloqk,  Eerlijke boekingssoftware voor kappers",
        template: "%s | Bloqk",
    },
    description: siteConfig.description,
    applicationName: siteConfig.name,
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        locale: siteConfig.locale,
        url: "/",
        siteName: siteConfig.name,
        title: "Bloqk,  Eerlijke boekingssoftware voor kappers",
        description: siteConfig.description,
    },
    twitter: {
        card: "summary_large_image",
        title: "Bloqk,  Eerlijke boekingssoftware voor kappers",
        description: siteConfig.description,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },
    formatDetection: {
        telephone: false,
    },
};

export const viewport: Viewport = {
    themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0d" },
    ],
    colorScheme: "light",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
    <html
    lang="nl"
    suppressHydrationWarning
    className={cn("h-full", "antialiased", comfortaa.variable, "font-sans")}
    >
    <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
    </body>
    </html>
    );
}
