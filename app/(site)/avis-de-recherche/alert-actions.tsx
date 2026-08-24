"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { closeSearchAlertAction, deleteSearchAlertAction } from "@/lib/actions/search-alerts";
import { Button } from "@/components/ui/button";

export function AlertActions({ alertId }: { alertId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => startTransition(async () => {
          await closeSearchAlertAction(alertId);
          router.refresh();
        })}
      >
        Marquer comme trouvé
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => startTransition(async () => {
          await deleteSearchAlertAction(alertId);
          router.refresh();
        })}
      >
        Supprimer
      </Button>
    </div>
  );
}
