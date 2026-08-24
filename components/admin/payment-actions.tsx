"use client";

import { ReasonActionButton, ConfirmActionButton } from "@/components/admin/action-buttons";
import { confirmPaymentAction, rejectPaymentAction } from "@/lib/actions/payments";

export function PaymentActions({ paymentId, adminId }: { paymentId: string; adminId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ConfirmActionButton
        label="Confirmer"
        confirmMessage="Confirmer ce paiement ?"
        variant="primary"
        action={() => confirmPaymentAction(paymentId, adminId)}
      />
      <ReasonActionButton
        label="Rejeter"
        title="Rejeter ce paiement"
        actionLabel="Confirmer le rejet"
        variant="danger"
        placeholder="Motif du rejet..."
        action={(reason) => rejectPaymentAction(paymentId, adminId, reason)}
      />
    </div>
  );
}
