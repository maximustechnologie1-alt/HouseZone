"use client";

import { ReasonActionButton, ConfirmActionButton } from "@/components/admin/action-buttons";
import { moderateListingAction } from "@/lib/actions/listings";

export function ListingModerationActions({ listingId, adminId }: { listingId: string; adminId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ConfirmActionButton
        label="Approuver"
        confirmMessage="Approuver cette annonce ?"
        variant="primary"
        action={() => moderateListingAction(listingId, adminId, "active")}
      />
      <ReasonActionButton
        label="Refuser"
        title="Refuser cette annonce"
        actionLabel="Confirmer le refus"
        variant="outline"
        placeholder="Motif du refus..."
        action={(reason) => moderateListingAction(listingId, adminId, "refusee", reason)}
      />
      <ReasonActionButton
        label="Bloquer"
        title="Bloquer cette annonce"
        actionLabel="Confirmer le blocage"
        variant="danger"
        placeholder="Motif du blocage..."
        action={(reason) => moderateListingAction(listingId, adminId, "bloquee", reason)}
      />
    </div>
  );
}
