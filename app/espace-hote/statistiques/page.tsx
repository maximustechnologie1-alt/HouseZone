import { Building2, CalendarClock, Eye, Heart, MessageCircle } from "lucide-react";
import { requireHost } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LISTING_STATUS_LABELS, VISIT_STATUS_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { ListingStatus, VisitStatus } from "@/lib/types/database";

export const metadata = { title: "Statistiques" };

interface ListingStatRow {
  id: string;
  title: string;
  price: number;
  status: ListingStatus;
  views_count: number;
  favorites_count: number;
}

export default async function HostStatsPage() {
  const { profile } = await requireHost();
  const supabase = await createClient();

  const [{ data: listings }, { data: visits }, { data: conversations }] = await Promise.all([
    supabase
      .from("listings")
      .select("id,title,price,status,views_count,favorites_count")
      .eq("host_id", profile.id),
    supabase.from("visit_requests").select("status").eq("host_id", profile.id),
    supabase.from("conversations").select("listing_id, messages(count)").eq("host_id", profile.id),
  ]);

  const rows = (listings ?? []) as ListingStatRow[];
  const totalViews = rows.reduce((sum, l) => sum + (l.views_count ?? 0), 0);
  const totalFavorites = rows.reduce((sum, l) => sum + (l.favorites_count ?? 0), 0);
  const activeCount = rows.filter((l) => l.status === "active").length;

  // Section 45 du CDC : le nombre de messages fait partie des indicateurs par
  // annonce, au même titre que les vues et les favoris.
  const messageCountsByListing = new Map<string, number>();
  for (const c of (conversations ?? []) as { listing_id: string; messages: { count: number }[] }[]) {
    const count = c.messages?.[0]?.count ?? 0;
    messageCountsByListing.set(c.listing_id, (messageCountsByListing.get(c.listing_id) ?? 0) + count);
  }
  const totalMessages = [...messageCountsByListing.values()].reduce((sum, n) => sum + n, 0);

  const visitsByStatus = (Object.keys(VISIT_STATUS_LABELS) as VisitStatus[]).map((status) => ({
    status,
    count: (visits ?? []).filter((v) => v.status === status).length,
  }));

  const topListings = [...rows].sort((a, b) => b.views_count - a.views_count);

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Statistiques</h1>
      <p className="mt-1 text-sm text-hz-ink/60">Suivez les performances de vos annonces.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-card border border-hz-navy/10 bg-white p-4">
          <Building2 className="h-5 w-5 text-hz-blue" />
          <p className="mt-2 text-2xl font-semibold text-hz-navy">{activeCount}</p>
          <p className="text-xs text-hz-ink/60">Annonces actives</p>
        </div>
        <div className="rounded-card border border-hz-navy/10 bg-white p-4">
          <Eye className="h-5 w-5 text-hz-blue" />
          <p className="mt-2 text-2xl font-semibold text-hz-navy">{totalViews}</p>
          <p className="text-xs text-hz-ink/60">Vues totales</p>
        </div>
        <div className="rounded-card border border-hz-navy/10 bg-white p-4">
          <Heart className="h-5 w-5 text-hz-blue" />
          <p className="mt-2 text-2xl font-semibold text-hz-navy">{totalFavorites}</p>
          <p className="text-xs text-hz-ink/60">Favoris totaux</p>
        </div>
        <div className="rounded-card border border-hz-navy/10 bg-white p-4">
          <CalendarClock className="h-5 w-5 text-hz-blue" />
          <p className="mt-2 text-2xl font-semibold text-hz-navy">{(visits ?? []).length}</p>
          <p className="text-xs text-hz-ink/60">Demandes de visite</p>
        </div>
        <div className="rounded-card border border-hz-navy/10 bg-white p-4">
          <MessageCircle className="h-5 w-5 text-hz-blue" />
          <p className="mt-2 text-2xl font-semibold text-hz-navy">{totalMessages}</p>
          <p className="text-xs text-hz-ink/60">Messages reçus</p>
        </div>
      </div>

      <div className="mt-6 rounded-card border border-hz-navy/10 bg-white p-5">
        <h2 className="font-medium text-hz-navy">Visites par statut</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visitsByStatus.map(({ status, count }) => (
            <div key={status} className="rounded-xl bg-hz-sky/50 px-3 py-2">
              <p className="text-lg font-semibold text-hz-navy">{count}</p>
              <p className="text-xs text-hz-ink/60">{VISIT_STATUS_LABELS[status]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-card border border-hz-navy/10 bg-white p-5">
        <h2 className="font-medium text-hz-navy">Annonces les plus performantes</h2>
        {topListings.length === 0 ? (
          <p className="mt-3 text-sm text-hz-ink/50">Aucune annonce pour le moment.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-hz-navy/10 text-xs text-hz-ink/50">
                  <th className="pb-2 font-medium">Annonce</th>
                  <th className="pb-2 font-medium">Statut</th>
                  <th className="pb-2 font-medium">Prix</th>
                  <th className="pb-2 font-medium">Vues</th>
                  <th className="pb-2 font-medium">Favoris</th>
                  <th className="pb-2 font-medium">Messages</th>
                </tr>
              </thead>
              <tbody>
                {topListings.map((l) => (
                  <tr key={l.id} className="border-b border-hz-navy/5">
                    <td className="max-w-[220px] truncate py-2 pr-2 text-hz-navy">{l.title}</td>
                    <td className="py-2 pr-2 text-hz-ink/70">{LISTING_STATUS_LABELS[l.status]}</td>
                    <td className="py-2 pr-2 text-hz-ink/70">{formatPrice(l.price)}</td>
                    <td className="py-2 pr-2 text-hz-ink/70">{l.views_count}</td>
                    <td className="py-2 pr-2 text-hz-ink/70">{l.favorites_count}</td>
                    <td className="py-2 text-hz-ink/70">{messageCountsByListing.get(l.id) ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
