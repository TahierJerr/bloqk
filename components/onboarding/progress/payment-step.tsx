"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEuro, type PaymentPlan } from "@/lib/pricing";

/**
 * Inhoud van de APPROVED-stap: de opbouw van het bedrag (nu te betalen
 * vs. automatische incasso's daarna) en de betaalknop. Zonder
 * betaalplan (maatwerk) tonen we de offerte-melding.
 */
export function PaymentStep({
  salonName,
  payment,
  failureNote,
  inProgress,
  busy,
  onPay,
}: {
  salonName: string;
  payment: PaymentPlan | null;
  failureNote: string | null;
  inProgress: boolean;
  busy: boolean;
  onPay: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Goedgekeurd! Rond de betaling af, daarna zetten we {salonName} live.
      </p>
      {payment ? (
        <>
          {/* Opbouw van het bedrag */}
          <div className="divide-y overflow-hidden rounded-xl border bg-background">
            {payment.lines.map((line) => (
              <div
                key={line.label}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
              >
                <span className="text-muted-foreground">{line.label}</span>
                <span className="font-medium tabular-nums">
                  {formatEuro(line.amount)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 bg-muted/50 px-4 py-2.5 text-sm font-semibold">
              <span>Nu te betalen</span>
              <span className="tabular-nums">{formatEuro(payment.dueNow)}</span>
            </div>
            {payment.recurring.map((line) => (
              <div
                key={line.label}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs text-muted-foreground"
              >
                <span>{line.label}</span>
                <span className="tabular-nums">{formatEuro(line.amount)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {payment.afterNote}
          </p>
          <p className="rounded-xl bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
            0% commissie op boekingen, elke euro die je klanten betalen is voor
            jou.
          </p>
          {failureNote && (
            <p className="text-sm font-medium text-destructive">
              {failureNote}
            </p>
          )}
          {inProgress ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              We wachten op de bevestiging van je betaling. Dit kan even duren,
              je hoeft niets te doen.
            </div>
          ) : (
            <div>
              <Button
                onClick={onPay}
                disabled={busy}
                className="cursor-pointer"
              >
                {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Betalen ({formatEuro(payment.dueNow)})
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Je wordt veilig doorgestuurd naar onze betaalpagina.
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Maatwerk heeft geen vaste prijs; we nemen contact met je op om de
          betaling af te ronden.
        </p>
      )}
    </div>
  );
}
