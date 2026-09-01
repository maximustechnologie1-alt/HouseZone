"use client";

import { ReasonActionButton, ConfirmActionButton } from "@/components/admin/action-buttons";
import { approveHostApplicationAction, rejectHostApplicationAction } from "@/lib/actions/host-application";
import { toggleHostBadgeAction, suspendHostAction, reactivateHostAction } from "@/lib/actions/admin";
import type { VerificationStatus } from "@/lib/types/database";

export function HostApplicationActions({
  hostProfileId,
  adminId,
  verificationStatus,
  badgeVerified,
}: {
  hostProfileId: string;
  adminId: string;
  verificationStatus: VerificationStatus;
  badgeVerified: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {verificationStatus !== "accepte" && (
        <ConfirmActionButton
          label="Accepter"
          confirmMessage="Accepter ce dossier Hôte ?"
          variant="primary"
          action={() => approveHostApplicationAction(hostProfileId, adminId)}
        />
      )}
      {verificationStatus !== "refuse" && (
        <ReasonActionButton
          label="Refuser"
          title="Refuser ce dossier Hôte"
          actionLabel="Confirmer le refus"
          variant="danger"
          placeholder="Motif du refus..."
          action={(reason) => rejectHostApplicationAction(hostProfileId, adminId, reason)}
        />
      )}
      {verificationStatus === "accepte" && (
        <>
          <ConfirmActionButton
            label={badgeVerified ? "Retirer le badge vérifié" : "Attribuer le badge vérifié"}
            confirmMessage={
              badgeVerified ? "Retirer le badge vérifié à cet hôte ?" : "Attribuer le badge vérifié à cet hôte ?"
            }
            variant="gold"
            action={() => toggleHostBadgeAction(hostProfileId, adminId, !badgeVerified)}
          />
          <ReasonActionButton
            label="Suspendre le statut Hôte"
            title="Suspendre le statut Hôte"
            actionLabel="Confirmer la suspension"
            variant="danger"
            placeholder="Motif de la suspension..."
            action={(reason) => suspendHostAction(hostProfileId, adminId, reason)}
          />
        </>
      )}
      {verificationStatus === "suspendu" && (
        <ConfirmActionButton
          label="Réactiver le statut Hôte"
          confirmMessage="Réactiver le statut Hôte de ce compte ?"
          variant="primary"
          action={() => reactivateHostAction(hostProfileId, adminId)}
        />
      )}
    </div>
  );
}
