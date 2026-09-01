import { ClipboardList } from "lucide-react";
import { requireHost } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata = { title: "Avis de recherche" };

interface AlertRow {
  id: string;
  description: string | null;
  characteristics: string | null;
  budget_min: number | null;
  budget_max: number | null;
  created_at: string;
  cities: { name: string } | null;
  property_categories: { name: string } | null;
  client: { first_name: string; last_name: string } | null;
}

export default async function HostSearchAlertsPage() {
  const { profile } = await requireHost();
  const supabase = await createClient();

  const [{ data: alerts }, { data: subscription }] = await Promise.all([
    supabase
      .from("search_alerts")
      .select(
        "id, description, characteristics, budget_min, budget_max, created_at, cities ( name ), property_categories ( name ), client:profiles!search_alerts_client_id_fkey ( first_name, last_name )"
      )
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("status")
      .eq("host_id", profile.id)
      .in("status", ["essai", "actif"])
      .maybeSingle(),
  ]);

  const rows = (alerts ?? []) as unknown as AlertRow[];

  if (!subscription && rows.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-hz-navy">Avis de recherche</h1>
        <div className="mt-6">
          <EmptyState
            icon={ClipboardList}
            title="Accès réservé aux abonnés"
            description="Un abonnement actif (ou une période d'essai) est nécessaire pour consulter les avis de recherche publiés par les clients."
            action={<LinkButton href="/espace-hote/abonnement" size="sm">Voir les formules</LinkButton>}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Avis de recherche</h1>
      <p className="mt-1 text-sm text-hz-ink/60">
        Découvrez ce que recherchent les clients et contactez-les via une de vos annonces correspondantes.
      </p>

      <div className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Aucun avis de recherche actif"
            description="Revenez plus tard, les nouvelles recherches des clients apparaîtront ici."
          />
        ) : (
          rows.map((alert) => (
            <div key={alert.id} className="rounded-card border border-hz-navy/10 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-hz-navy">
                  {alert.property_categories?.name ?? "Tout type"} {alert.cities?.name ? `à ${alert.cities.name}` : ""}
                </p>
                <span className="text-xs text-hz-ink/40">Publié le {formatDate(alert.created_at)}</span>
              </div>
              <p className="mt-1 text-sm text-hz-ink/60">
                {alert.budget_min || alert.budget_max
                  ? `Budget : ${alert.budget_min ? formatPrice(alert.budget_min) : "…"} - ${
                      alert.budget_max ? formatPrice(alert.budget_max) : "…"
                    }`
                  : "Budget non précisé"}
              </p>
              {alert.description && <p className="mt-2 text-sm text-hz-ink/80">{alert.description}</p>}
              {alert.characteristics && (
                <p className="mt-1 text-xs text-hz-ink/50">Caractéristiques : {alert.characteristics}</p>
              )}
              {alert.client && (
                <p className="mt-3 text-xs text-hz-ink/50">
                  Publié par {alert.client.first_name} {alert.client.last_name}. Contactez-le via une conversation
                  démarrée depuis une annonce correspondante.
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
