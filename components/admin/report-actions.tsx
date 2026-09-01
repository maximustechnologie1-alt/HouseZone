"use client";

import { ReasonActionButton, ConfirmActionButton } from "@/components/admin/action-buttons";
import { resolveReportAction, sanctionReportedUserAction } from "@/lib/actions/admin";
import type { ReportTargetType } from "@/lib/types/database";

export function ReportActions({
  reportId,
  adminId,
  targetType,
  targetId,
}: {
  reportId: string;
  adminId: string;
  targetType: ReportTargetType;
  targetId: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <ConfirmActionButton
        label="Marquer en analyse"
        confirmMessage="Passer ce signalement en analyse ?"
        variant="outline"
        action={() => resolveReportAction(reportId, adminId, "en_analyse")}
      />
      <ReasonActionButton
        label="Traiter"
        title="Marquer comme traité"
        actionLabel="Confirmer"
        variant="primary"
        requireReason={false}
        placeholder="Notes de résolution (facultatif)..."
        action={(notes) => resolveReportAction(reportId, adminId, "traite", notes || undefined)}
      />
      <ReasonActionButton
        label="Rejeter"
        title="Rejeter le signalement"
        actionLabel="Confirmer le rejet"
        variant="outline"
        requireReason={false}
        placeholder="Notes (facultatif)..."
        action={(notes) => resolveReportAction(reportId, adminId, "rejete", notes || undefined)}
      />
      {targetType === "user" ? (
        <>
          <ReasonActionButton
            label="Suspendre l'utilisateur"
            title="Suspendre l'utilisateur signalé"
            actionLabel="Confirmer la suspension"
            variant="danger"
            requireReason={false}
            placeholder="Motif de la sanction (facultatif)..."
            action={(reason) => sanctionReportedUserAction(reportId, targetId, adminId, "suspended", reason || undefined)}
          />
          <ReasonActionButton
            label="Bannir l'utilisateur"
            title="Bannir l'utilisateur signalé"
            actionLabel="Confirmer le bannissement"
            variant="danger"
            requireReason={false}
            placeholder="Motif de la sanction (facultatif)..."
            action={(reason) => sanctionReportedUserAction(reportId, targetId, adminId, "banned", reason || undefined)}
          />
        </>
      ) : (
        <ReasonActionButton
          label="Action effectuée"
          title="Marquer qu'une action a été effectuée"
          actionLabel="Confirmer"
          variant="danger"
          requireReason={false}
          placeholder="Notes sur l'action effectuée (facultatif)..."
          action={(notes) => resolveReportAction(reportId, adminId, "action_effectuee", notes || undefined)}
        />
      )}
    </div>
  );
}
