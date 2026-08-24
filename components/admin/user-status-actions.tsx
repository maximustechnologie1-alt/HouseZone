"use client";

import { ReasonActionButton, ConfirmActionButton } from "@/components/admin/action-buttons";
import { updateUserStatusAction } from "@/lib/actions/admin";
import type { UserStatus } from "@/lib/types/database";

export function UserStatusActions({
  userId,
  adminId,
  status,
}: {
  userId: string;
  adminId: string;
  status: UserStatus;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {status !== "suspended" && (
        <ReasonActionButton
          label="Suspendre"
          title="Suspendre cet utilisateur"
          actionLabel="Confirmer la suspension"
          variant="outline"
          placeholder="Raison de la suspension..."
          action={(reason) => updateUserStatusAction(userId, adminId, "suspended" as UserStatus, reason)}
        />
      )}
      {status !== "active" && (
        <ConfirmActionButton
          label="Réactiver"
          confirmMessage="Réactiver cet utilisateur ?"
          variant="outline"
          action={() => updateUserStatusAction(userId, adminId, "active" as UserStatus)}
        />
      )}
      {status !== "banned" && (
        <ReasonActionButton
          label="Bannir"
          title="Bannir cet utilisateur"
          actionLabel="Confirmer le bannissement"
          variant="danger"
          placeholder="Raison du bannissement..."
          action={(reason) => updateUserStatusAction(userId, adminId, "banned" as UserStatus, reason)}
        />
      )}
    </div>
  );
}
