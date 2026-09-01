import { History } from "lucide-react";
import { requireHost } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { SubscriptionPaymentRequestStatusBadge } from "@/components/admin/status-badges";
import { CancelPaymentRequestButton } from "./cancel-request-button";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import type { SubscriptionPaymentRequest } from "@/lib/types/database";

export const metadata = { title: "Historique des abonnements" };

export default async function SubscriptionHistoryPage() {
  const { profile } = await requireHost();
  const supabase = await createClient();

  const { data } = await supabase
    .from("subscription_payment_requests")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const requests = (data ?? []) as SubscriptionPaymentRequest[];

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Historique des abonnements</h1>

      <div className="mt-6 space-y-3">
        {requests.length === 0 ? (
          <EmptyState
            icon={History}
            title="Aucune demande d'abonnement"
            description="Vos demandes de paiement pour un abonnement apparaîtront ici."
          />
        ) : (
          requests.map((r) => (
            <div key={r.id} className="rounded-card border border-hz-navy/10 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-hz-navy">
                    {r.plan_name} — {r.duration_months} mois
                  </p>
                  <p className="text-xs text-hz-ink/50">
                    {formatDate(r.created_at)} · {formatPrice(r.amount)} · {PAYMENT_METHOD_LABELS[r.payment_method]}
                  </p>
                </div>
                <SubscriptionPaymentRequestStatusBadge status={r.status} />
              </div>
              {r.status === "REJECTED" && r.rejection_reason && (
                <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  Motif : {r.rejection_reason}
                </p>
              )}
              {r.status === "APPROVED" && r.subscription_end && (
                <p className="mt-2 text-xs text-hz-ink/50">Expiration : {formatDate(r.subscription_end)}</p>
              )}
              {r.status === "PENDING" && (
                <div className="mt-3">
                  <CancelPaymentRequestButton requestId={r.id} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
