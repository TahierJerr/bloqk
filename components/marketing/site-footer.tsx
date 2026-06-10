import Link from "next/link";
import { Logo } from "@/components/logo";

const links = [
    { href: "/pricing", label: "Prijzen" },
    { href: "/stack", label: "Stack" },
    { href: "/privacy", label: "Privacy" },
];

export function SiteFooter() {
    return (
        <footer className="border-t border-border">
            <div className="mx-auto max-w-5xl px-6 py-16">
                <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-xs">
                        <Logo size="sm" />
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                            Eerlijke software voor kappers. Geen commissie, geen verrassingen.
                        </p>
                    </div>
                    <nav className="flex flex-col gap-3 text-sm">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <span>© {new Date().getFullYear()} Bloqk</span>
                    <span>Gebouwd in Nederland 🇳🇱</span>
                </div>
            </div>
        </footer>
    );
}
