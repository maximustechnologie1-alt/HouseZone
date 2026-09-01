import { CreditCard } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatusTabs } from "@/components/admin/status-tabs";
import { PaymentStatusBadge } from "@/components/admin/status-badges";
import { PaymentActions } from "@/components/admin/payment-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime, formatPrice } from "@/lib/utils";
import type { PaymentStatus, PaymentMethod } from "@/lib/types/database";

export const metadata = { title: "Paiements" };

const TABS: { value: PaymentStatus | ""; label: string }[] = [
  { value: "en_attente", label: "En attente" },
  { value: "reussi", label: "Réussis" },
  { value: "echoue", label: "Échoués" },
  { value: "annule", label: "Annulés" },
  { value: "rembourse", label: "Remboursés" },
  { value: "", label: "Tous" },
];

const METHOD_LABELS: Record<PaymentMethod, string> = {
  mobile_money: "Mobile Money",
  carte: "Carte bancaire",
};

export default async function AdminPaymentsPage({ searchParams }: PageProps<"/admin/paiements">) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const statut = typeof params.statut === "string" ? (params.statut as PaymentStatus) : "en_attente";

  const supabase = await createClient();
  let query = supabase
    .from("payments")
    .select(
      "id, amount, method, provider_reference, status, created_at, profiles!payments_user_id_fkey ( first_name, last_name ), receipts ( receipt_number )"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (statut) query = query.eq("status", statut);

  const { data } = await query;

  type Row = {
    id: string;
    amount: number;
    method: PaymentMethod;
    provider_reference: string | null;
    status: PaymentStatus;
    created_at: string;
    profiles: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
    receipts: { receipt_number: string }[] | { receipt_number: string } | null;
  };

  const rows = (data ?? []) as Row[];

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Paiements</h1>

      <div className="mt-4">
        <StatusTabs basePath="/admin/paiements" current={statut} tabs={TABS} />
      </div>

      <div className="mt-5 overflow-x-auto rounded-card border border-hz-navy/10 bg-white">
        {rows.length === 0 ? (
          <EmptyState icon={CreditCard} title="Aucun paiement" description="Aucun paiement pour ce filtre." />
        ) : (
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="text-left text-xs uppercase text-hz-ink/50">
              <tr>
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Méthode</th>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Reçu</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
                {statut === "en_attente" && <th className="px-4 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-hz-navy/10">
              {rows.map((p) => {
                const user = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
                const receipt = Array.isArray(p.receipts) ? p.receipts[0] : p.receipts;
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-hz-navy">
                      {user ? `${user.first_name} ${user.last_name}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-hz-ink/70">{formatPrice(p.amount)}</td>
                    <td className="px-4 py-3 text-hz-ink/70">{METHOD_LABELS[p.method]}</td>
                    <td className="px-4 py-3 text-hz-ink/60">{p.provider_reference ?? "—"}</td>
                    <td className="px-4 py-3 text-hz-ink/60">{receipt?.receipt_number ?? "—"}</td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-hz-ink/60">{formatDateTime(p.created_at)}</td>
                    {statut === "en_attente" && (
                      <td className="px-4 py-3">
                        <PaymentActions paymentId={p.id} adminId={admin.id} />
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
