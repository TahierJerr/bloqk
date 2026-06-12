"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Loader2, PartyPopper, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChoiceBlock } from "@/components/order-form/choice-block";
import type { OrderProgressInfo } from "./progress-config";

function DnsRecordsTable({ order }: { order: OrderProgressInfo }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-background text-sm">
      <div className="grid grid-cols-[4.5rem_5rem_1fr] gap-2 border-b bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span>Type</span>
        <span>Naam</span>
        <span>Waarde</span>
      </div>
      {order.dnsRecords.map((record) => (
        <div
          key={`${record.type}-${record.name}`}
          className="grid grid-cols-[4.5rem_5rem_1fr] gap-2 border-b px-4 py-2 last:border-b-0"
        >
          <span className="font-medium">{record.type}</span>
          <span className="tabular-nums">{record.name}</span>
          <code className="truncate text-xs leading-5">{record.value}</code>
        </div>
      ))}
    </div>
  );
}

/**
 * Inhoud van de PAID-stap. Naast de betalingsbevestiging vragen we
 * klanten met een eigen domein wie het domein gaat beheren:
 * - Bloqk beheert: verhuiscode (EPP) nu of later invullen; daarna
 *   maken wij de Cloudflare-zone aan en vragen we de overdracht aan
 * - Zelf beheren: de klant krijgt de DNS-instellingen te zien
 */
export function PaidStep({ order }: { order: OrderProgressInfo }) {
  const router = useRouter();
  const [mode, setMode] = useState<"managed" | "self" | null>(null);
  const [eppCode, setEppCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askDomainChoice =
    order.domainSource === "existing" && order.domain !== null;

  async function submitChoice(body: Record<string, string>) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/order/domain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(
        typeof data?.error === "string"
          ? data.error
          : "Er ging iets mis. Probeer het opnieuw.",
      );
      setBusy(false);
      return;
    }
    setBusy(false);
    setEppCode("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <PartyPopper className="mt-0.5 size-5 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Betaling ontvangen! We zetten {order.salonName} nu live. Je krijgt
          bericht zodra alles online staat, daarna opent je dashboard hier
          vanzelf.
        </p>
      </div>

      {askDomainChoice && !order.dnsChoice && (
        <div className="flex flex-col gap-3 border-t pt-4">
          <p className="text-sm font-medium">
            Nog één keuze: wie beheert {order.domain}?
          </p>
          <div className="flex flex-col gap-2.5">
            <ChoiceBlock
              icon={ShieldCheck}
              label="Bloqk beheert mijn domein"
              description="Wij nemen het domein en de DNS-instellingen volledig uit handen. Jij hoeft niets te doen."
              selected={mode === "managed"}
              onSelect={() => setMode("managed")}
            />
            <ChoiceBlock
              icon={Wrench}
              label="Ik beheer mijn domein zelf"
              description="Je houdt je domein bij je huidige provider; wij geven je de DNS-instellingen."
              selected={mode === "self"}
              onSelect={() => setMode("self")}
            />
          </div>

          {mode === "managed" && (
            <div className="flex flex-col gap-2">
              <label htmlFor="eppCode" className="text-sm font-medium">
                Verhuiscode (EPP){" "}
                <span className="font-normal text-muted-foreground">
                  — optioneel, kan ook later
                </span>
              </label>
              <Input
                id="eppCode"
                value={eppCode}
                onChange={(event) => setEppCode(event.target.value)}
                placeholder="Bijv. A1B2-C3D4-E5F6"
              />
              <p className="text-xs text-muted-foreground">
                Je verhuiscode vraag je op bij je huidige domeinprovider. Heb
                je hem nog niet? Bevestig gewoon, dan vul je hem later in.
              </p>
              <Button
                onClick={() =>
                  submitChoice({ choice: "managed", eppCode: eppCode.trim() })
                }
                disabled={busy}
                className="cursor-pointer self-start"
              >
                {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Regel het voor mij
              </Button>
            </div>
          )}

          {mode === "self" && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                Dit zijn de DNS-records die je straks bij je provider instelt
                (mag ook later, ze blijven hier zichtbaar):
              </p>
              <DnsRecordsTable order={order} />
              <Button
                onClick={() => submitChoice({ choice: "self" })}
                disabled={busy}
                className="cursor-pointer self-start"
              >
                {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Ik beheer mijn domein zelf
              </Button>
            </div>
          )}
        </div>
      )}

      {askDomainChoice && order.dnsChoice === "managed" && (
        <div className="flex flex-col gap-2 border-t pt-4">
          {order.transferRequested ? (
            <p className="text-sm font-medium text-emerald-700">
              ✓ Overdracht van {order.domain} aangevraagd. Wij regelen de
              rest; je hoort van ons zodra het domein verhuisd is.
            </p>
          ) : order.hasEppCode ? (
            <p className="text-sm text-muted-foreground">
              We hebben je verhuiscode ontvangen en zetten de overdracht van{" "}
              {order.domain} in gang.
            </p>
          ) : (
            <>
              <p className="text-sm font-medium">
                Wij beheren straks {order.domain}. Vul je verhuiscode (EPP) in
                zodra je hem hebt:
              </p>
              <Input
                value={eppCode}
                onChange={(event) => setEppCode(event.target.value)}
                placeholder="Bijv. A1B2-C3D4-E5F6"
                aria-label="Verhuiscode"
              />
              <p className="text-xs text-muted-foreground">
                Op te vragen bij je huidige domeinprovider.
              </p>
              <Button
                onClick={() =>
                  submitChoice({ choice: "managed", eppCode: eppCode.trim() })
                }
                disabled={busy || eppCode.trim().length < 4}
                className="cursor-pointer self-start"
              >
                {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Verhuiscode opslaan
              </Button>
            </>
          )}
        </div>
      )}

      {askDomainChoice && order.dnsChoice === "self" && (
        <div className="flex flex-col gap-2 border-t pt-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Globe className="size-4 text-primary" />
            Jouw DNS-instellingen voor {order.domain}
          </p>
          <p className="text-xs text-muted-foreground">
            Zet deze records bij je domeinprovider; mag ook later, ze blijven
            hier staan. Vragen? Mail support@bloqk.nl.
          </p>
          <DnsRecordsTable order={order} />
        </div>
      )}

      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
