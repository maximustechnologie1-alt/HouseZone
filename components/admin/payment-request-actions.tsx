"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/field";
import {
  approveSubscriptionPaymentRequestAction,
  rejectSubscriptionPaymentRequestAction,
} from "@/lib/actions/subscription-payments";
import { PAYMENT_REJECTION_REASONS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export function ApprovePaymentRequestButton({
  requestId,
  amount,
  durationMonths,
}: {
  requestId: string;
  amount: number;
  durationMonths: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        ✅ Approuver
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Confirmer l'approbation du paiement ?">
        <div className="space-y-4">
          <p className="text-sm text-hz-ink/70">
            Montant : <span className="font-medium text-hz-navy">{formatPrice(amount)}</span>
            <br />
            Abonnement : <span className="font-medium text-hz-navy">{durationMonths} mois</span>
          </p>
          <p className="text-xs text-hz-ink/50">
            Vérifiez que le transfert a bien été reçu sur votre compte Mobile Money avant de confirmer — une
            capture d&apos;écran ne suffit pas à valider automatiquement le paiement.
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await approveSubscriptionPaymentRequestAction(requestId);
                  setOpen(false);
                  router.refresh();
                })
              }
            >
              {pending ? "..." : "Confirmer"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function RejectPaymentRequestButton({ requestId }: { requestId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(PAYMENT_REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const finalReason = reason === "Autre" ? customReason.trim() : reason;

  return (
    <>
      <Button type="button" variant="danger" size="sm" onClick={() => setOpen(true)}>
        ❌ Refuser
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Motif du refus">
        <div className="space-y-4">
          <Select value={reason} onChange={(e) => setReason(e.target.value)}>
            {PAYMENT_REJECTION_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
          {reason === "Autre" && (
            <Textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Précisez le motif..."
              rows={3}
            />
          )}
          <Button
            type="button"
            variant="danger"
            className="w-full"
            disabled={pending || finalReason.length === 0}
            onClick={() =>
              startTransition(async () => {
                await rejectSubscriptionPaymentRequestAction(requestId, finalReason);
                setOpen(false);
                router.refresh();
              })
            }
          >
            {pending ? "Envoi..." : "Confirmer le refus"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
