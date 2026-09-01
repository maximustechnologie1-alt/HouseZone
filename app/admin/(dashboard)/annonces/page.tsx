import Link from "next/link";
import { Building2, AlertTriangle } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatusTabs } from "@/components/admin/status-tabs";
import { Badge } from "@/components/ui/badge";
import { ListingModerationActions } from "@/components/admin/listing-moderation-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { LISTING_STATUS_COLORS, LISTING_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import type { ListingStatus } from "@/lib/types/database";

export const metadata = { title: "Annonces" };

const TABS: { value: ListingStatus | ""; label: string }[] = [
  { value: "en_attente", label: "En attente" },
  { value: "active", label: "Actives" },
  { value: "refusee", label: "Refusées" },
  { value: "bloquee", label: "Bloquées" },
  { value: "indisponible", label: "Indisponibles" },
  { value: "", label: "Toutes" },
];

export default async function AdminListingsPage({ searchParams }: PageProps<"/admin/annonces">) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const statut: ListingStatus | "" = typeof params.statut === "string" ? (params.statut as ListingStatus) : "en_attente";

  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(
      "id, title, status, price, moderation_flag, created_at, cities ( name ), profiles!listings_host_id_fkey ( first_name, last_name )"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (statut) query = query.eq("status", statut);

  const { data } = await query;

  type Row = {
    id: string;
    title: string;
    status: ListingStatus;
    price: number;
    moderation_flag: boolean;
    created_at: string;
    cities: { name: string } | { name: string }[] | null;
    profiles: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
  };

  const rows = (data ?? []) as Row[];
  const needsAction = !statut || statut === "en_attente";

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Annonces</h1>

      <div className="mt-4">
        <StatusTabs basePath="/admin/annonces" current={statut} tabs={TABS} />
      </div>

      <div className="mt-5 overflow-x-auto rounded-card border border-hz-navy/10 bg-white">
        {rows.length === 0 ? (
          <EmptyState icon={Building2} title="Aucune annonce" description="Aucune annonce pour ce filtre." />
        ) : (
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="text-left text-xs uppercase text-hz-ink/50">
              <tr>
                <th className="px-4 py-3">Annonce</th>
                <th className="px-4 py-3">Hôte</th>
                <th className="px-4 py-3">Ville</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Publiée</th>
                {needsAction && <th className="px-4 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-hz-navy/10">
              {rows.map((l) => {
                const city = Array.isArray(l.cities) ? l.cities[0] : l.cities;
                const host = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles;
                return (
                  <tr key={l.id}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/annonces/${l.id}`} className="font-medium text-hz-navy hover:underline">
                        {l.title}
                      </Link>
                      {l.moderation_flag && (
                        <Badge className="ml-2 bg-amber-100 text-amber-700">
                          <AlertTriangle className="mr-1 inline h-3 w-3" /> Signalée OCR
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-hz-ink/70">{host ? `${host.first_name} ${host.last_name}` : "—"}</td>
                    <td className="px-4 py-3 text-hz-ink/70">{city?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-hz-ink/70">{formatPrice(l.price)}</td>
                    <td className="px-4 py-3">
                      <Badge className={LISTING_STATUS_COLORS[l.status]}>{LISTING_STATUS_LABELS[l.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-hz-ink/60">{formatDate(l.created_at)}</td>
                    {needsAction && (
                      <td className="px-4 py-3">
                        <ListingModerationActions listingId={l.id} adminId={admin.id} status={l.status} />
                      </td>
                    )}
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
