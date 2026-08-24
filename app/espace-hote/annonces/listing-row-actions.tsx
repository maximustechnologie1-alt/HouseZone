"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  markListingAvailableAction,
  markListingUnavailableAction,
  markListingCompletedAction,
  deleteListingAction,
} from "@/lib/actions/listings";
import type { ListingStatus, OperationType } from "@/lib/types/database";

export function ListingRowActions({
  listingId,
  status,
  operationType,
}: {
  listingId: string;
  status: ListingStatus;
  operationType: OperationType;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "active" && (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => run(() => markListingUnavailableAction(listingId))}
        >
          Marquer indisponible
        </Button>
      )}
      {status === "indisponible" && (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => run(() => markListingAvailableAction(listingId))}
        >
          Marquer disponible
        </Button>
      )}
      {(status === "active" || status === "indisponible") && operationType === "location" && (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => run(() => markListingCompletedAction(listingId, "louee"))}
        >
          Louée
        </Button>
      )}
      {(status === "active" || status === "indisponible") && operationType === "vente" && (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => run(() => markListingCompletedAction(listingId, "vendue"))}
        >
          Vendue
        </Button>
      )}
      <Button
        variant="danger"
        size="sm"
        disabled={pending}
        onClick={() => {
          if (window.confirm("Supprimer définitivement cette annonce ?")) {
            run(() => deleteListingAction(listingId));
          }
        }}
      >
        Supprimer
      </Button>
    </div>
  );
}
