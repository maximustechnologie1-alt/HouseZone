"use client";

import { useActionState, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea, FormError } from "@/components/ui/field";
import { submitSubscriptionPaymentRequestAction, type ActionState } from "@/lib/actions/subscription-payments";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_EMOJI, PAYMENT_METHOD_COLORS } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import type { PaymentMethodConfig, PaymentMethodType } from "@/lib/types/database";

const initialState: ActionState = {};

export function SubscriptionPaymentFlow({
  planId,
  amount,
  methods,
}: {
  planId: string;
  amount: number;
  methods: PaymentMethodConfig[];
}) {
  const [selected, setSelected] = useState<PaymentMethodConfig | null>(null);
  const [step, setStep] = useState<"choose" | "info" | "proof">("choose");

  if (methods.length === 0) {
    return (
      <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Aucun moyen de paiement n&apos;est disponible pour le moment. Contactez le support HouseZone.
      </p>
    );
  }

  if (step === "choose") {
    return (
      <div>
        <p className="mb-3 text-sm font-medium text-hz-navy">Choisissez votre moyen de paiement</p>
        <div className="space-y-3">
          {methods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setSelected(m);
                setStep("info");
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-card border p-4 text-left hover:brightness-95",
                PAYMENT_METHOD_COLORS[m.method]
              )}
            >
              <span className="text-2xl">{PAYMENT_METHOD_EMOJI[m.method]}</span>
              <span className="font-semibold text-hz-navy">{PAYMENT_METHOD_LABELS[m.method]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "info" && selected) {
    return <PaymentInfoStep method={selected} amount={amount} onProceed={() => setStep("proof")} onBack={() => setStep("choose")} />;
  }

  if (step === "proof" && selected) {
    return <ProofStep planId={planId} method={selected.method} onBack={() => setStep("info")} />;
  }

  return null;
}

function PaymentInfoStep({
  method,
  amount,
  onProceed,
  onBack,
}: {
  method: PaymentMethodConfig;
  amount: number;
  onProceed: () => void;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(method.account_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible — l'utilisateur peut toujours sélectionner le numéro manuellement.
    }
  }

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-3 text-xs font-medium text-hz-blue">
        ← Changer de moyen de paiement
      </button>

      <div className={cn("rounded-card border p-5", PAYMENT_METHOD_COLORS[method.method])}>
        <p className="flex items-center gap-2 text-lg font-semibold text-hz-navy">
          <span>{PAYMENT_METHOD_EMOJI[method.method]}</span> {PAYMENT_METHOD_LABELS[method.method].toUpperCase()}
        </p>

        <div className="mt-4 space-y-3 text-sm">
          <InfoRow label="Montant à payer" value={formatPrice(amount)} strong />
          <InfoRow label="Bénéficiaire" value={method.account_name} />
          <InfoRow label="Numéro de réception" value={method.account_number} />
          <InfoRow label="Motif" value={method.payment_reference} />
        </div>

        {method.payment_instructions && (
          <p className="mt-4 whitespace-pre-line rounded-xl bg-white/70 px-3 py-2.5 text-sm text-hz-ink/80">
            {method.payment_instructions}
          </p>
        )}

        <p className="mt-3 text-xs text-hz-ink/60">
          Après avoir effectué le transfert, envoyez votre preuve de paiement.
        </p>

        <Button type="button" variant="outline" size="sm" className="mt-4 w-full bg-white" onClick={copyNumber}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Numéro copié !" : "Copier le numéro"}
        </Button>
      </div>

      <Button type="button" size="lg" className="mt-4 w-full" onClick={onProceed}>
        J&apos;ai effectué le paiement
      </Button>
    </div>
  );
}

function InfoRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-hz-ink/60">{label}</span>
      <span className={strong ? "text-base font-bold text-hz-navy" : "font-medium text-hz-navy"}>{value}</span>
    </div>
  );
}

function ProofStep({
  planId,
  method,
  onBack,
}: {
  planId: string;
  method: PaymentMethodType;
  onBack: () => void;
}) {
  const action = submitSubscriptionPaymentRequestAction.bind(null, planId, method);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-3 text-xs font-medium text-hz-blue">
        ← Retour
      </button>

      <p className="text-sm font-medium text-hz-navy">Envoyer votre preuve de paiement</p>

      <form action={formAction} className="mt-4 space-y-4">
        <FormError message={state.error} />
        <FormField label="Numéro utilisé pour effectuer le transfert" htmlFor="payerPhone">
          <Input id="payerPhone" name="payerPhone" required placeholder="70 00 00 00" />
        </FormField>
        <FormField label="Capture d'écran" htmlFor="proof">
          <Input id="proof" name="proof" type="file" accept="image/*" required />
        </FormField>
        <FormField label="Commentaire (facultatif)" htmlFor="comment">
          <Textarea id="comment" name="comment" rows={2} />
        </FormField>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Envoi..." : "Envoyer ma demande"}
        </Button>
      </form>
    </div>
  );
}
