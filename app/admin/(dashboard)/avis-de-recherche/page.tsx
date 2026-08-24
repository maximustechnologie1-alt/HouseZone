import { ClipboardList, AlertTriangle } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { SearchAlertStatusBadge } from "@/components/admin/status-badges";
import { ConfirmActionButton } from "@/components/admin/action-buttons";
import { closeSearchAlertAsAdminAction } from "@/lib/actions/admin";
import { EmptyState } from "@/components/listings/property-card";
import { formatDate, formatPrice } from "@/lib/utils";
import type { SearchAlertStatus } from "@/lib/types/database";

export const metadata = { title: "Avis de recherche" };

export default async function AdminSearchAlertsPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("search_alerts")
    .select(
      "id, status, moderation_flag, budget_min, budget_max, characteristics, description, created_at, profiles!search_alerts_client_id_fkey ( first_name, last_name ), cities ( name )"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  type Row = {
    id: string;
    status: SearchAlertStatus;
    moderation_flag: boolean;
    budget_min: number | null;
    budget_max: number | null;
    characteristics: string | null;
    description: string | null;
    created_at: string;
    profiles: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
    cities: { name: string } | { name: string }[] | null;
  };

  const rows = (data ?? []) as Row[];
  const flagged = rows.filter((r) => r.moderation_flag || r.status === "bloquee");
  const others = rows.filter((r) => !r.moderation_flag && r.status !== "bloquee");
  const ordered = [...flagged, ...others];

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Avis de recherche</h1>
      <p className="mt-1 max-w-2xl text-sm text-hz-ink/60">
        Contrôle anti-abus : les avis marqués ou bloqués sont mis en avant en priorité — ils peuvent masquer une
        fausse annonce déguisée (section 24 du CDC).
      </p>

      <div className="mt-5 overflow-x-auto rounded-card border border-hz-navy/10 bg-white">
        {ordered.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Aucun avis de recherche" description="Aucun avis de recherche enregistré." />
        ) : (
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="text-left text-xs uppercase text-hz-ink/50">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Ville</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hz-navy/10">
              {ordered.map((a) => {
                const client = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
                const city = Array.isArray(a.cities) ? a.cities[0] : a.cities;
                const isFlagged = a.moderation_flag || a.status === "bloquee";
                return (
                  <tr key={a.id} className={isFlagged ? "bg-red-50/50" : undefined}>
                    <td className="px-4 py-3 font-medium text-hz-navy">
                      {client ? `${client.first_name} ${client.last_name}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-hz-ink/70">{city?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-hz-ink/70">
                      {a.budget_min ? formatPrice(a.budget_min) : "—"} - {a.budget_max ? formatPrice(a.budget_max) : "—"}
                    </td>
                    <td className="px-4 py-3 max-w-[260px] truncate text-hz-ink/60">
                      {a.description ?? a.characteristics ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <SearchAlertStatusBadge status={a.status} />
                        {a.moderation_flag && (
                          <Badge className="bg-amber-100 text-amber-700">
                            <AlertTriangle className="mr-1 inline h-3 w-3" /> Signalé
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-hz-ink/60">{formatDate(a.created_at)}</td>
                    <td className="px-4 py-3">
                      {a.status !== "fermee" && (
                        <ConfirmActionButton
                          label="Fermer"
                          confirmMessage="Fermer cet avis de recherche ?"
                          variant="outline"
                          action={() => closeSearchAlertAsAdminAction(a.id, admin.id)}
                        />
                      )}
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
