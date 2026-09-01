"use client";

import { useTransition } from "react";
import { updateRiskLevelAction } from "@/lib/actions/admin";
import type { RiskLevel } from "@/lib/types/database";

const OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: "faible", label: "Faible" },
  { value: "a_surveiller", label: "À surveiller" },
  { value: "risque", label: "Risqué" },
  { value: "critique", label: "Critique" },
];

export function RiskLevelSelect({
  userId,
  adminId,
  riskLevel,
}: {
  userId: string;
  adminId: string;
  riskLevel: RiskLevel;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={riskLevel}
      disabled={pending}
      onChange={(e) => startTransition(() => updateRiskLevelAction(userId, adminId, e.target.value as RiskLevel))}
      className="rounded-lg border border-hz-navy/15 bg-white px-2 py-1 text-sm text-hz-ink"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
