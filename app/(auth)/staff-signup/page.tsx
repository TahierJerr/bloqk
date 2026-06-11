import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { StaffSignUpForm } from "@/components/auth/staff-sign-up-form";
import prismadb from "@/lib/prismadb";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const { token } = await searchParams;

    // De token uit de uitnodigingsmail bewijst dat iemand hier hoort te
    // zijn én aan welke salon die gekoppeld moet worden
    const invite = token
        ? await prismadb.staffInvite.findUnique({
              where: { token },
              include: { salon: { select: { name: true } } },
          })
        : null;
    const valid = invite && !invite.acceptedAt && invite.expiresAt > new Date();

    if (!valid) {
        return (
            <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 text-center md:p-10">
                <Logo className="mb-6" />
                <h1 className="text-xl font-semibold tracking-tight">
                    Deze uitnodiging is verlopen of ongeldig
                </h1>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Vraag de eigenaar van je salon om een nieuwe uitnodiging te
                    sturen, of log in als je al een account hebt.
                </p>
                <Button asChild variant="outline" className="mt-6">
                    <Link href="/sign-in">Naar inloggen</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Logo className="flex justify-center mb-6" />
                <StaffSignUpForm
                    token={invite.token}
                    email={invite.email}
                    salonName={invite.salon.name}
                />
            </div>
        </div>
    );
}
