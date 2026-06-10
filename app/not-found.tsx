import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <main className="flex min-h-svh flex-col items-center justify-center px-6 py-16 text-center">
            <Logo size="lg" />

            <p className="mt-10 text-7xl font-light tracking-tight sm:text-8xl">
                404<span className="text-primary select-none">.</span>
            </p>

            <h1 className="mt-6 text-2xl font-semibold tracking-tight">
                Deze pagina bestaat niet
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
                Misschien is de link verouderd, of is de pagina verhuisd.
                Geen zorgen, je knipbeurt gaat gewoon door.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <Button asChild>
                    <Link href="/">Naar de homepage</Link>
                </Button>
                <Button asChild variant="ghost" className="text-muted-foreground">
                    <a href="mailto:support@bloqk.nl">Hulp nodig?</a>
                </Button>
            </div>
        </main>
    );
}
