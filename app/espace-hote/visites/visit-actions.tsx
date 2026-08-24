"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { acceptVisitAction, refuseVisitAction, completeVisitAction } from "@/lib/actions/visits";

export function AcceptRefuseActions({ visitId }: { visitId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <>
      <Button size="sm" disabled={pending} onClick={() => run(() => acceptVisitAction(visitId))}>
        Accepter
      </Button>
      <Button variant="outline" size="sm" disabled={pending} onClick={() => run(() => refuseVisitAction(visitId))}>
        Refuser
      </Button>
    </>
  );
}

export function CompleteVisitButton({ visitId }: { visitId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await completeVisitAction(visitId);
          router.refresh();
        })
      }
    >
      Marquer terminée
    </Button>
  );
}
