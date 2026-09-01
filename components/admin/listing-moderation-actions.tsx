"use client";

import { ReasonActionButton, ConfirmActionButton } from "@/components/admin/action-buttons";
import { moderateListingAction } from "@/lib/actions/listings";
import type { ListingStatus } from "@/lib/types/database";

const RESTORABLE_STATUSES: ListingStatus[] = ["refusee", "bloquee", "indisponible"];

export function ListingModerationActions({
  listingId,
  adminId,
  status,
}: {
  listingId: string;
  adminId: string;
  status: ListingStatus;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {status !== "active" && (
        <ConfirmActionButton
          label={RESTORABLE_STATUSES.includes(status) ? "Restaurer" : "Approuver"}
          confirmMessage={
            RESTORABLE_STATUSES.includes(status) ? "Restaurer cette annonce (la remettre en ligne) ?" : "Approuver cette annonce ?"
          }
          variant="primary"
          action={() => moderateListingAction(listingId, adminId, "active")}
        />
      )}
      {status !== "refusee" && (
        <ReasonActionButton
          label="Refuser"
          title="Refuser cette annonce"
          actionLabel="Confirmer le refus"
          variant="outline"
          placeholder="Motif du refus..."
          action={(reason) => moderateListingAction(listingId, adminId, "refusee", reason)}
        />
      )}
      {status !== "bloquee" && (
        <ReasonActionButton
          label="Bloquer"
          title="Bloquer cette annonce"
          actionLabel="Confirmer le blocage"
          variant="danger"
          placeholder="Motif du blocage..."
          action={(reason) => moderateListingAction(listingId, adminId, "bloquee", reason)}
        />
      )}
      {status === "active" && (
        <ReasonActionButton
          label="Désactiver"
          title="Désactiver cette annonce"
          actionLabel="Confirmer la désactivation"
          variant="outline"
          placeholder="Motif (facultatif)..."
          action={(reason) => moderateListingAction(listingId, adminId, "indisponible", reason)}
        />
      )}
    </div>
  );
}
