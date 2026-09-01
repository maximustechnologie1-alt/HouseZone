import { ScrollText } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Journal d'audit" };

export default async function AdminAuditLogPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("audit_logs")
    .select(
      "id, action, target_type, target_id, reason, created_at, admin:profiles!audit_logs_admin_id_fkey ( first_name, last_name ), target_user:profiles!audit_logs_target_user_id_fkey ( first_name, last_name )"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  type Row = {
    id: string;
    action: string;
    target_type: string;
    target_id: string | null;
    reason: string | null;
    created_at: string;
    admin: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
    target_user: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
  };

  const rows = (data ?? []) as Row[];

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Journal d&apos;audit</h1>
      <p className="mt-1 text-sm text-hz-ink/60">Les 100 dernières actions administratives.</p>

      <div className="mt-5 overflow-x-auto rounded-card border border-hz-navy/10 bg-white">
        {rows.length === 0 ? (
          <EmptyState icon={ScrollText} title="Aucune entrée" description="Aucune action administrative enregistrée." />
        ) : (
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="text-left text-xs uppercase text-hz-ink/50">
              <tr>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Cible</th>
                <th className="px-4 py-3">Utilisateur ciblé</th>
                <th className="px-4 py-3">Raison</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hz-navy/10">
              {rows.map((r) => {
                const admin = Array.isArray(r.admin) ? r.admin[0] : r.admin;
                const targetUser = Array.isArray(r.target_user) ? r.target_user[0] : r.target_user;
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium text-hz-navy">
                      {admin ? `${admin.first_name} ${admin.last_name}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-hz-ink/70">{r.action}</td>
                    <td className="px-4 py-3 text-hz-ink/60">
                      {r.target_type}
                      {r.target_id ? ` · ${r.target_id.slice(0, 8)}…` : ""}
                    </td>
                    <td className="px-4 py-3 text-hz-ink/60">
                      {targetUser ? `${targetUser.first_name} ${targetUser.last_name}` : "—"}
                    </td>
                    <td className="px-4 py-3 max-w-[240px] truncate text-hz-ink/60">{r.reason ?? "—"}</td>
                    <td className="px-4 py-3 text-hz-ink/60">{formatDateTime(r.created_at)}</td>
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
