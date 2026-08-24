import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/stat-card";
import { LISTING_STATUS_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { ListingStatus } from "@/lib/types/database";

export const metadata = { title: "Statistiques" };

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { month: "short", year: "2-digit" }).format(date);
}

export default async function AdminStatsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    { data: listingsAll },
    { data: categories },
    { data: usersForGrowth },
    { data: paymentsThisMonth },
    { data: paymentsLastMonth },
    { data: cities },
  ] = await Promise.all([
    supabase.from("listings").select("status, category_id"),
    supabase.from("property_categories").select("id, name"),
    supabase.from("profiles").select("created_at").gte("created_at", sixMonthsAgo.toISOString()),
    supabase.from("payments").select("amount").eq("status", "reussi").gte("created_at", startOfMonth.toISOString()),
    supabase
      .from("payments")
      .select("amount")
      .eq("status", "reussi")
      .gte("created_at", startOfLastMonth.toISOString())
      .lt("created_at", startOfMonth.toISOString()),
    supabase.from("cities").select("id, name"),
  ]);

  const listingsByStatus = new Map<ListingStatus, number>();
  const listingsByCategory = new Map<string, number>();
  const listingsByCity = new Map<string, number>();

  for (const l of listingsAll ?? []) {
    listingsByStatus.set(l.status as ListingStatus, (listingsByStatus.get(l.status as ListingStatus) ?? 0) + 1);
    if (l.category_id) listingsByCategory.set(l.category_id, (listingsByCategory.get(l.category_id) ?? 0) + 1);
  }

  const { data: listingsWithCity } = await supabase.from("listings").select("city_id");
  for (const l of listingsWithCity ?? []) {
    if (l.city_id) listingsByCity.set(l.city_id, (listingsByCity.get(l.city_id) ?? 0) + 1);
  }

  const categoryNameById = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const cityNameById = new Map((cities ?? []).map((c) => [c.id, c.name]));

  const topCities = [...listingsByCity.entries()]
    .map(([id, count]) => ({ name: cityNameById.get(id) ?? id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Croissance des utilisateurs par mois (6 derniers mois).
  const months: { key: string; label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabel(d), count: 0 });
  }
  for (const u of usersForGrowth ?? []) {
    const d = new Date(u.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.count += 1;
  }

  const revenueThisMonth = (paymentsThisMonth ?? []).reduce((acc, p) => acc + (p.amount ?? 0), 0);
  const revenueLastMonth = (paymentsLastMonth ?? []).reduce((acc, p) => acc + (p.amount ?? 0), 0);

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Statistiques</h1>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <StatCard label="Revenus ce mois-ci" value={formatPrice(revenueThisMonth)} />
        <StatCard label="Revenus mois précédent" value={formatPrice(revenueLastMonth)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold text-hz-navy">Annonces par statut</h2>
          <ul className="mt-3 divide-y divide-hz-navy/10 text-sm">
            {[...listingsByStatus.entries()].map(([status, count]) => (
              <li key={status} className="flex items-center justify-between py-2">
                <span className="text-hz-ink/70">{LISTING_STATUS_LABELS[status]}</span>
                <span className="font-medium text-hz-navy">{count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-hz-navy">Annonces par catégorie</h2>
          <ul className="mt-3 divide-y divide-hz-navy/10 text-sm">
            {[...listingsByCategory.entries()].map(([categoryId, count]) => (
              <li key={categoryId} className="flex items-center justify-between py-2">
                <span className="text-hz-ink/70">{categoryNameById.get(categoryId) ?? categoryId}</span>
                <span className="font-medium text-hz-navy">{count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-hz-navy">Croissance des utilisateurs (6 derniers mois)</h2>
          <ul className="mt-3 divide-y divide-hz-navy/10 text-sm">
            {months.map((m) => (
              <li key={m.key} className="flex items-center justify-between py-2">
                <span className="capitalize text-hz-ink/70">{m.label}</span>
                <span className="font-medium text-hz-navy">{m.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-hz-navy">Top villes par nombre d&apos;annonces</h2>
          <ul className="mt-3 divide-y divide-hz-navy/10 text-sm">
            {topCities.length === 0 && <li className="py-2 text-hz-ink/50">Aucune donnée.</li>}
            {topCities.map((c) => (
              <li key={c.name} className="flex items-center justify-between py-2">
                <span className="text-hz-ink/70">{c.name}</span>
                <span className="font-medium text-hz-navy">{c.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
