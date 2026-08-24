"use client";

import { ReasonActionButton, ConfirmActionButton } from "@/components/admin/action-buttons";
import { resolveReportAction } from "@/lib/actions/admin";

export function ReportActions({ reportId, adminId }: { reportId: string; adminId: string }) {
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
      <ReasonActionButton
        label="Action effectuée"
        title="Marquer qu'une action a été effectuée"
        actionLabel="Confirmer"
        variant="danger"
        requireReason={false}
        placeholder="Notes sur l'action effectuée (facultatif)..."
        action={(notes) => resolveReportAction(reportId, adminId, "action_effectuee", notes || undefined)}
      />
    </div>
  );
}
