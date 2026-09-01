import { ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatusTabs } from "@/components/admin/status-tabs";
import { VerificationStatusBadge } from "@/components/admin/status-badges";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { HOST_TYPE_LABELS } from "@/lib/constants";
import type { VerificationStatus } from "@/lib/types/database";

export const metadata = { title: "Hôtes & vérifications" };

const TABS: { value: VerificationStatus | ""; label: string }[] = [
  { value: "", label: "Tous" },
  { value: "en_cours", label: "En cours" },
  { value: "accepte", label: "Acceptés" },
  { value: "refuse", label: "Refusés" },
];

export default async function AdminHostsPage({ searchParams }: PageProps<"/admin/hotes">) {
  await requireAdmin();
  const params = await searchParams;
  const statut = typeof params.statut === "string" ? (params.statut as VerificationStatus) : "en_cours";

  const supabase = await createClient();
  let query = supabase
    .from("host_profiles")
    .select(
      "id, host_type, verification_status, badge_verified, submitted_at, created_at, profiles!host_profiles_user_id_fkey ( id, first_name, last_name, email, phone )"
    )
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .limit(50);

  if (statut) query = query.eq("verification_status", statut);

  const { data } = await query;

  type Row = {
    id: string;
    host_type: string;
    verification_status: VerificationStatus;
    badge_verified: boolean;
    submitted_at: string | null;
    created_at: string;
    profiles: { id: string; first_name: string; last_name: string; email: string | null; phone: string | null } | { id: string; first_name: string; last_name: string; email: string | null; phone: string | null }[] | null;
  };

  const rows = (data ?? []) as Row[];

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Hôtes & vérifications</h1>

      <div className="mt-4">
        <StatusTabs basePath="/admin/hotes" current={statut} tabs={TABS.map((t) => ({ value: t.value, label: t.label }))} />
      </div>

      <div className="mt-5 overflow-x-auto rounded-card border border-hz-navy/10 bg-white">
        {rows.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="Aucun dossier" description="Aucun dossier hôte pour ce filtre." />
        ) : (
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-left text-xs uppercase text-hz-ink/50">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Badge</th>
                <th className="px-4 py-3">Soumis le</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hz-navy/10">
              {rows.map((r) => {
                const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium text-hz-navy">
                      {p ? `${p.first_name} ${p.last_name}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-hz-ink/70">
                      <p>{p?.email ?? "—"}</p>
                      <p className="text-xs text-hz-ink/50">{p?.phone ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-hz-ink/70">
                      {HOST_TYPE_LABELS[r.host_type as keyof typeof HOST_TYPE_LABELS] ?? r.host_type}
                    </td>
                    <td className="px-4 py-3">
                      <VerificationStatusBadge status={r.verification_status} />
                    </td>
                    <td className="px-4 py-3">
                      {r.badge_verified ? <Badge className="bg-hz-gold/15 text-hz-navy">Vérifié</Badge> : "—"}
                    </td>
                    <td className="px-4 py-3 text-hz-ink/60">{r.submitted_at ? formatDate(r.submitted_at) : "—"}</td>
                    <td className="px-4 py-3">
                      <LinkButton href={`/admin/hotes/${r.id}`} variant="outline" size="sm">
                        Examiner
                      </LinkButton>
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
