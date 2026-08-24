import { requireHost } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/button";
import { SUBSCRIPTION_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import { AutoRenewToggle, CancelSubscriptionButton } from "./subscription-actions";
import type { Subscription, SubscriptionPlan } from "@/lib/types/database";

export const metadata = { title: "Abonnement" };

export default async function HostSubscriptionPage() {
  const { profile, hostProfile } = await requireHost();
  const supabase = await createClient();

  const [{ data: subscription }, { data: plans }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*")
      .eq("host_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("subscription_plans")
      .select("*")
      .eq("host_type", hostProfile.host_type)
      .eq("active", true)
      .order("price"),
  ]);

  const sub = subscription as Subscription | null;
  const planRows = (plans ?? []) as SubscriptionPlan[];

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Abonnement</h1>

      <div className="mt-6 rounded-card border border-hz-navy/10 bg-white p-5">
        <h2 className="font-medium text-hz-navy">Statut actuel</h2>
        {sub ? (
          <>
            <p className="mt-2 text-sm text-hz-ink/70">
              Statut : <span className="font-medium text-hz-navy">{SUBSCRIPTION_STATUS_LABELS[sub.status]}</span>
            </p>
            <p className="mt-1 text-sm text-hz-ink/70">Valide jusqu&apos;au {formatDate(sub.end_date)}</p>
            {sub.status === "actif" && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <AutoRenewToggle subscriptionId={sub.id} autoRenew={sub.auto_renew} />
                <CancelSubscriptionButton subscriptionId={sub.id} />
              </div>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm text-hz-ink/70">Vous n&apos;avez pas encore d&apos;abonnement.</p>
        )}
      </div>

      <div className="mt-6">
        <h2 className="font-medium text-hz-navy">Formules disponibles</h2>
        {planRows.length === 0 ? (
          <p className="mt-2 text-sm text-hz-ink/50">Aucune formule disponible pour votre type d&apos;Hôte.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {planRows.map((plan) => (
              <div key={plan.id} className="rounded-card border border-hz-navy/10 bg-white p-5">
                <p className="font-medium text-hz-navy">{plan.name}</p>
                <p className="mt-1 text-2xl font-semibold text-hz-navy">{formatPrice(plan.price)}</p>
                <p className="text-xs text-hz-ink/50">{plan.duration_months} mois</p>
                <LinkButton href={`/espace-hote/abonnement/paiement?plan=${plan.id}`} size="sm" className="mt-4 w-full">
                  S&apos;abonner
                </LinkButton>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
