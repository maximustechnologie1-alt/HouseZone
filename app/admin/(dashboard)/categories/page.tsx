import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui/badge";
import { AddCityForm } from "@/components/admin/add-city-form";
import { NeighborhoodsManager } from "@/components/admin/neighborhoods-manager";
import { ConfirmActionButton } from "@/components/admin/action-buttons";
import { toggleCategoryActiveAction } from "@/lib/actions/admin";
import type { City, Neighborhood, PropertyCategory } from "@/lib/types/database";

export const metadata = { title: "Catégories & villes" };

const FAMILY_LABELS: Record<PropertyCategory["family"], string> = {
  maison: "Maison",
  appartement: "Appartement",
  terrain: "Terrain",
};

export default async function AdminCategoriesPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const [{ data: cities }, { data: neighborhoods }, { data: categories }] = await Promise.all([
    supabase.from("cities").select("*").order("name"),
    supabase.from("neighborhoods").select("*").order("name"),
    supabase.from("property_categories").select("*").order("family").order("sort_order"),
  ]);

  const categoriesByFamily = new Map<PropertyCategory["family"], PropertyCategory[]>();
  for (const c of (categories ?? []) as PropertyCategory[]) {
    if (!categoriesByFamily.has(c.family)) categoriesByFamily.set(c.family, []);
    categoriesByFamily.get(c.family)!.push(c);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Catégories & villes</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold text-hz-navy">Villes</h2>
          <ul className="mt-3 divide-y divide-hz-navy/10 text-sm">
            {(cities ?? []).length === 0 && <li className="py-2 text-hz-ink/50">Aucune ville.</li>}
            {((cities ?? []) as City[]).map((c) => (
              <li key={c.id} className="py-2 text-hz-ink/70">
                {c.name}
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-hz-navy/10 pt-4">
            <AddCityForm adminId={admin.id} />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-hz-navy">Quartiers</h2>
          <div className="mt-3">
            <NeighborhoodsManager cities={(cities ?? []) as City[]} neighborhoods={(neighborhoods ?? []) as Neighborhood[]} />
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-hz-navy">Catégories de biens</h2>
        <div className="mt-3 space-y-6">
          {Array.from(categoriesByFamily.entries()).map(([family, items]) => (
            <div key={family} className="rounded-card border border-hz-navy/10 bg-white p-4">
              <h3 className="font-medium text-hz-navy">{FAMILY_LABELS[family]}</h3>
              <div className="mt-3 divide-y divide-hz-navy/10">
                {items.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-hz-navy">{cat.name}</span>
                      <Badge className={cat.active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}>
                        {cat.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <ConfirmActionButton
                      label={cat.active ? "Désactiver" : "Activer"}
                      variant="outline"
                      action={() => toggleCategoryActiveAction(cat.id, !cat.active)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
