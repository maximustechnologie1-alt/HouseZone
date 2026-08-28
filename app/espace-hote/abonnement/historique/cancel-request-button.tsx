"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelSubscriptionPaymentRequestAction } from "@/lib/actions/subscription-payments";
import { Button } from "@/components/ui/button";

export function CancelPaymentRequestButton({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Annuler cette demande de paiement ?")) return;
        startTransition(async () => {
          await cancelSubscriptionPaymentRequestAction(requestId);
          router.refresh();
        });
      }}
    >
      Annuler la demande
    </Button>
  );
}
