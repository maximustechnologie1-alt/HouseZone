"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelVisitAction } from "@/lib/actions/visits";
import { Button } from "@/components/ui/button";

export function CancelVisitButton({ visitId }: { visitId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await cancelVisitAction(visitId);
          router.refresh();
        })
      }
    >
      Annuler la demande
    </Button>
  );
}
