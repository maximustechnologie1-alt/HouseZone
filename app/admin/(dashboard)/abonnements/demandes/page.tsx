import Link from "next/link";
import { FileClock } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatusTabs } from "@/components/admin/status-tabs";
import { SubscriptionPaymentRequestStatusBadge } from "@/components/admin/status-badges";
import { EmptyState } from "@/components/ui/empty-state";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatDateTime, formatPrice } from "@/lib/utils";
import type { SubscriptionPaymentRequestStatus } from "@/lib/types/database";

export const metadata = { title: "Demandes d'abonnement" };

const TABS: { value: SubscriptionPaymentRequestStatus | ""; label: string }[] = [
  { value: "PENDING", label: "En attente" },
  { value: "APPROVED", label: "Validées" },
  { value: "REJECTED", label: "Refusées" },
  { value: "CANCELLED", label: "Annulées" },
  { value: "", label: "Toutes" },
];

export default async function AdminSubscriptionRequestsPage({
  searchParams,
}: PageProps<"/admin/abonnements/demandes">) {
  await requireAdmin();
  const params = await searchParams;
  const statut = typeof params.statut === "string" ? (params.statut as SubscriptionPaymentRequestStatus) : "PENDING";

  const supabase = await createClient();
  let query = supabase
    .from("subscription_payment_requests")
    .select(
      "id, plan_name, duration_months, amount, payment_method, payer_phone, status, created_at, profiles!subscription_payment_requests_user_id_fkey ( first_name, last_name )"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (statut) query = query.eq("status", statut);

  const { data } = await query;

  interface Row {
    id: string;
    plan_name: string;
    duration_months: number;
    amount: number;
    payment_method: keyof typeof PAYMENT_METHOD_LABELS;
    payer_phone: string;
    status: SubscriptionPaymentRequestStatus;
    created_at: string;
    profiles: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
  }

  const rows = (data ?? []) as unknown as Row[];

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Demandes d&apos;abonnement</h1>
      <p className="mt-1 text-sm text-hz-ink/60">
        Paiements Mobile Money envoyés par les Hôtes, en attente de vérification manuelle.
      </p>

      <div className="mt-4">
        <StatusTabs basePath="/admin/abonnements/demandes" current={statut} tabs={TABS} />
      </div>

      <div className="mt-5 overflow-x-auto rounded-card border border-hz-navy/10 bg-white">
        {rows.length === 0 ? (
          <EmptyState icon={FileClock} title="Aucune demande" description="Aucune demande pour ce filtre." />
        ) : (
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="text-left text-xs uppercase text-hz-ink/50">
              <tr>
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Abonnement</th>
                <th className="px-4 py-3">Durée</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Moyen</th>
                <th className="px-4 py-3">Numéro payeur</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hz-navy/10">
              {rows.map((r) => {
                const user = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium text-hz-navy">
                      {user ? `${user.first_name} ${user.last_name}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-hz-ink/70">{r.plan_name}</td>
                    <td className="px-4 py-3 text-hz-ink/70">{r.duration_months} mois</td>
                    <td className="px-4 py-3 text-hz-ink/70">{formatPrice(r.amount)}</td>
                    <td className="px-4 py-3 text-hz-ink/70">{PAYMENT_METHOD_LABELS[r.payment_method]}</td>
                    <td className="px-4 py-3 text-hz-ink/60">{r.payer_phone}</td>
                    <td className="px-4 py-3 text-hz-ink/60">{formatDateTime(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <SubscriptionPaymentRequestStatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/abonnements/demandes/${r.id}`} className="text-sm font-medium text-hz-blue">
                        Voir
                      </Link>
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
