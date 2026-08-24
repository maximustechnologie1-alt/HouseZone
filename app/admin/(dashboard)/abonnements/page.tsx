import { Receipt } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatusTabs } from "@/components/admin/status-tabs";
import { Badge } from "@/components/ui/badge";
import { SubscriptionPriceForm } from "@/components/admin/subscription-price-form";
import { EmptyState } from "@/components/listings/property-card";
import { SUBSCRIPTION_STATUS_LABELS, HOST_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import type { SubscriptionStatus, HostType, SubscriptionPlan } from "@/lib/types/database";

export const metadata = { title: "Abonnements" };

const TABS: { value: SubscriptionStatus | ""; label: string }[] = [
  { value: "essai", label: "Essai" },
  { value: "actif", label: "Actifs" },
  { value: "expire", label: "Expirés" },
  { value: "suspendu", label: "Suspendus" },
  { value: "annule", label: "Annulés" },
  { value: "", label: "Tous" },
];

const SUBSCRIPTION_STATUS_COLORS: Record<SubscriptionStatus, string> = {
  essai: "bg-blue-100 text-blue-700",
  actif: "bg-emerald-100 text-emerald-700",
  expire: "bg-zinc-100 text-zinc-500",
  suspendu: "bg-amber-100 text-amber-700",
  annule: "bg-red-100 text-red-700",
};

export default async function AdminSubscriptionsPage({ searchParams }: PageProps<"/admin/abonnements">) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const statut = typeof params.statut === "string" ? (params.statut as SubscriptionStatus) : "";

  const supabase = await createClient();
  let query = supabase
    .from("subscriptions")
    .select(
      "id, host_type, status, start_date, end_date, auto_renew, profiles!subscriptions_host_id_fkey ( first_name, last_name ), subscription_plans ( name, price )"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (statut) query = query.eq("status", statut);

  const { data: subscriptions } = await query;
  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("host_type", { ascending: true })
    .order("duration_months", { ascending: true });

  type SubRow = {
    id: string;
    host_type: HostType;
    status: SubscriptionStatus;
    start_date: string;
    end_date: string;
    auto_renew: boolean;
    profiles: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
    subscription_plans: { name: string; price: number } | { name: string; price: number }[] | null;
  };

  const rows = (subscriptions ?? []) as SubRow[];
  const plansByType = new Map<HostType, SubscriptionPlan[]>();
  for (const p of (plans ?? []) as SubscriptionPlan[]) {
    if (!plansByType.has(p.host_type)) plansByType.set(p.host_type, []);
    plansByType.get(p.host_type)!.push(p);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Abonnements</h1>

      <div className="mt-4">
        <StatusTabs basePath="/admin/abonnements" current={statut} tabs={TABS} />
      </div>

      <div className="mt-5 overflow-x-auto rounded-card border border-hz-navy/10 bg-white">
        {rows.length === 0 ? (
          <EmptyState icon={Receipt} title="Aucun abonnement" description="Aucun abonnement pour ce filtre." />
        ) : (
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="text-left text-xs uppercase text-hz-ink/50">
              <tr>
                <th className="px-4 py-3">Hôte</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Formule</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3">Période</th>
                <th className="px-4 py-3">Renouvellement</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hz-navy/10">
              {rows.map((s) => {
                const host = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
                const plan = Array.isArray(s.subscription_plans) ? s.subscription_plans[0] : s.subscription_plans;
                return (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-medium text-hz-navy">
                      {host ? `${host.first_name} ${host.last_name}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-hz-ink/70">{HOST_TYPE_LABELS[s.host_type]}</td>
                    <td className="px-4 py-3 text-hz-ink/70">{plan?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-hz-ink/70">{plan ? formatPrice(plan.price) : "—"}</td>
                    <td className="px-4 py-3 text-hz-ink/60">
                      {formatDate(s.start_date)} → {formatDate(s.end_date)}
                    </td>
                    <td className="px-4 py-3 text-hz-ink/60">{s.auto_renew ? "Auto" : "Manuel"}</td>
                    <td className="px-4 py-3">
                      <Badge className={SUBSCRIPTION_STATUS_COLORS[s.status]}>{SUBSCRIPTION_STATUS_LABELS[s.status]}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-hz-navy">Gestion des offres</h2>
        <div className="mt-3 space-y-6">
          {Array.from(plansByType.entries()).map(([hostType, typePlans]) => (
            <div key={hostType} className="rounded-card border border-hz-navy/10 bg-white p-4">
              <h3 className="font-medium text-hz-navy">{HOST_TYPE_LABELS[hostType]}</h3>
              <div className="mt-3 divide-y divide-hz-navy/10">
                {typePlans.map((plan) => (
                  <div key={plan.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-medium text-hz-navy">{plan.name}</p>
                      <p className="text-xs text-hz-ink/50">
                        {plan.duration_months} mois {plan.active ? "" : "· inactive"}
                      </p>
                    </div>
                    <SubscriptionPriceForm planId={plan.id} adminId={admin.id} initialPrice={plan.price} />
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
