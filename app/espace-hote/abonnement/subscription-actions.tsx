"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toggleAutoRenewAction, cancelSubscriptionAction } from "@/lib/actions/subscriptions";

export function AutoRenewToggle({ subscriptionId, autoRenew }: { subscriptionId: string; autoRenew: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleAutoRenewAction(subscriptionId, !autoRenew);
          router.refresh();
        })
      }
    >
      {autoRenew ? "Désactiver le renouvellement auto" : "Activer le renouvellement auto"}
    </Button>
  );
}

export function CancelSubscriptionButton({ subscriptionId }: { subscriptionId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (window.confirm("Annuler votre abonnement ?")) {
          startTransition(async () => {
            await cancelSubscriptionAction(subscriptionId);
            router.refresh();
          });
        }
      }}
    >
      Annuler l&apos;abonnement
    </Button>
  );
}
