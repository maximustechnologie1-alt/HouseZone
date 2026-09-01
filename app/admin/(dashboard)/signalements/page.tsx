import Link from "next/link";
import { Flag } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatusTabs } from "@/components/admin/status-tabs";
import { Badge } from "@/components/ui/badge";
import { ReportActions } from "@/components/admin/report-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import type { ReportStatus, ReportTargetType } from "@/lib/types/database";

export const metadata = { title: "Signalements" };

const TABS: { value: ReportStatus | ""; label: string }[] = [
  { value: "nouveau", label: "Nouveaux" },
  { value: "en_analyse", label: "En analyse" },
  { value: "traite", label: "Traités" },
  { value: "rejete", label: "Rejetés" },
  { value: "action_effectuee", label: "Action effectuée" },
  { value: "", label: "Tous" },
];

const REPORT_STATUS_COLORS: Record<ReportStatus, string> = {
  nouveau: "bg-amber-100 text-amber-700",
  en_analyse: "bg-blue-100 text-blue-700",
  traite: "bg-emerald-100 text-emerald-700",
  rejete: "bg-zinc-100 text-zinc-600",
  action_effectuee: "bg-red-100 text-red-700",
};

function targetLink(targetType: ReportTargetType, targetId: string) {
  if (targetType === "listing") return `/admin/annonces/${targetId}`;
  if (targetType === "user") return `/admin/utilisateurs/${targetId}`;
  return null;
}

export default async function AdminReportsPage({ searchParams }: PageProps<"/admin/signalements">) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const statut = typeof params.statut === "string" ? (params.statut as ReportStatus) : "nouveau";

  const supabase = await createClient();
  let query = supabase
    .from("reports")
    .select("id, target_type, target_id, reason, comment, status, created_at, profiles!reports_author_id_fkey ( first_name, last_name )")
    .order("created_at", { ascending: false })
    .limit(50);

  if (statut) query = query.eq("status", statut);

  const { data } = await query;

  type Row = {
    id: string;
    target_type: ReportTargetType;
    target_id: string;
    reason: string;
    comment: string | null;
    status: ReportStatus;
    created_at: string;
    profiles: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
  };

  const rows = (data ?? []) as Row[];

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Signalements</h1>

      <div className="mt-4">
        <StatusTabs basePath="/admin/signalements" current={statut} tabs={TABS} />
      </div>

      <div className="mt-5 overflow-x-auto rounded-card border border-hz-navy/10 bg-white">
        {rows.length === 0 ? (
          <EmptyState icon={Flag} title="Aucun signalement" description="Aucun signalement pour ce filtre." />
        ) : (
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="text-left text-xs uppercase text-hz-ink/50">
              <tr>
                <th className="px-4 py-3">Auteur</th>
                <th className="px-4 py-3">Cible</th>
                <th className="px-4 py-3">Motif</th>
                <th className="px-4 py-3">Commentaire</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hz-navy/10">
              {rows.map((r) => {
                const author = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
                const link = targetLink(r.target_type, r.target_id);
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium text-hz-navy">
                      {author ? `${author.first_name} ${author.last_name}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-hz-ink/70">
                      <p className="capitalize">{r.target_type}</p>
                      {link ? (
                        <Link href={link} className="text-xs font-medium text-hz-blue hover:underline">
                          Voir la cible
                        </Link>
                      ) : (
                        <p className="text-xs text-hz-ink/40">{r.target_id}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-hz-ink/70">{r.reason}</td>
                    <td className="px-4 py-3 max-w-[220px] truncate text-hz-ink/60">{r.comment ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge className={REPORT_STATUS_COLORS[r.status]}>{REPORT_STATUS_LABELS[r.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-hz-ink/60">{formatDateTime(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <ReportActions
                        reportId={r.id}
                        adminId={admin.id}
                        targetType={r.target_type}
                        targetId={r.target_id}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
