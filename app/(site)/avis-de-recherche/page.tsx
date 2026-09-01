import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/utils";
import { AlertActions } from "./alert-actions";

export const metadata = { title: "Avis de recherche" };

export default async function SearchAlertsPage() {
  const user = await requireUser("/avis-de-recherche");
  const supabase = await createClient();
  const { data: alerts } = await supabase
    .from("search_alerts")
    .select("*, cities ( name ), property_categories ( name )")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="hz-container py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-hz-navy">Mes avis de recherche</h1>
          <p className="mt-1 text-sm text-hz-ink/60">
            Publiez ce que vous recherchez, les Hôtes vérifiés pourront vous contacter.
          </p>
        </div>
        <LinkButton href="/avis-de-recherche/nouveau" size="sm">
          <Plus className="h-4 w-4" /> Nouveau
        </LinkButton>
      </div>

      <div className="mt-6 space-y-3">
        {!alerts || alerts.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Aucun avis de recherche"
            description="Vous ne trouvez pas le bien qu'il vous faut ? Décrivez votre recherche, les professionnels vérifiés pourront vous contacter."
            action={
              <Link href="/avis-de-recherche/nouveau" className="text-sm font-medium text-hz-blue">
                Publier un avis de recherche
              </Link>
            }
          />
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="rounded-card border border-hz-navy/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-hz-navy">
                    {alert.property_categories?.name ?? "Tout type"} {alert.cities?.name ? `à ${alert.cities.name}` : ""}
                  </p>
                  <p className="text-sm text-hz-ink/60">
                    {alert.budget_min || alert.budget_max
                      ? `Budget : ${alert.budget_min ? formatPrice(alert.budget_min) : "…"} - ${
                          alert.budget_max ? formatPrice(alert.budget_max) : "…"
                        }`
                      : "Budget non précisé"}
                  </p>
                </div>
                <span className="rounded-full bg-hz-sky px-2.5 py-1 text-xs font-medium text-hz-navy">
                  {alert.status === "active" ? "Active" : alert.status === "fermee" ? "Fermée" : "Bloquée"}
                </span>
              </div>
              <p className="mt-2 text-sm text-hz-ink/80">{alert.description}</p>
              <p className="mt-2 text-xs text-hz-ink/40">Publié le {formatDate(alert.created_at)}</p>
              {alert.status === "active" && (
                <div className="mt-3">
                  <AlertActions alertId={alert.id} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
