import { CreditCard } from "lucide-react";
import { requireHost } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatPrice } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/types/database";

export const metadata = { title: "Historique des paiements" };

interface PaymentRow {
  id: string;
  amount: number;
  method: "mobile_money" | "carte";
  status: PaymentStatus;
  provider_reference: string | null;
  created_at: string;
  receipts: { receipt_number: string }[] | { receipt_number: string } | null;
}

const STATUS_LABELS: Record<PaymentStatus, string> = {
  initie: "Initié",
  en_attente: "En attente de confirmation",
  reussi: "Réussi",
  echoue: "Échoué",
  annule: "Annulé",
  rembourse: "Remboursé",
};

const STATUS_COLORS: Record<PaymentStatus, string> = {
  initie: "bg-zinc-100 text-zinc-600",
  en_attente: "bg-amber-100 text-amber-700",
  reussi: "bg-emerald-100 text-emerald-700",
  echoue: "bg-red-100 text-red-700",
  annule: "bg-zinc-100 text-zinc-500",
  rembourse: "bg-blue-100 text-blue-700",
};

export default async function HostPaymentsPage({ searchParams }: PageProps<"/espace-hote/paiements">) {
  const { profile } = await requireHost();
  const { nouveau } = await searchParams;
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select("*, receipts ( receipt_number )")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const rows = (payments ?? []) as unknown as PaymentRow[];
  const highlighted = typeof nouveau === "string" ? rows.find((p) => p.id === nouveau) : undefined;
  const instructions =
    highlighted && highlighted.status !== "reussi"
      ? highlighted.method === "mobile_money"
        ? "Effectuez le transfert Mobile Money puis conservez la référence de transaction reçue par SMS. Votre abonnement sera activé dès vérification par notre équipe (généralement sous quelques heures)."
        : "Le paiement par carte sera confirmé manuellement par notre équipe pour cette version."
      : undefined;

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Historique des paiements</h1>

      {highlighted && instructions && (
        <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <p className="font-medium">Paiement enregistré</p>
          <p className="mt-1">{instructions}</p>
          {highlighted.provider_reference && (
            <p className="mt-1 text-xs">Référence : {highlighted.provider_reference}</p>
          )}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Aucun paiement"
            description="Vos paiements d'abonnement apparaîtront ici."
          />
        ) : (
          rows.map((p) => {
            const receipt = Array.isArray(p.receipts) ? p.receipts[0] : p.receipts;
            return (
              <div
                key={p.id}
                className={`rounded-card border p-4 ${
                  p.id === nouveau ? "border-hz-gold bg-hz-gold/5" : "border-hz-navy/10 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-hz-navy">{formatPrice(p.amount)}</p>
                    <p className="text-xs text-hz-ink/50">
                      {p.method === "mobile_money" ? "Mobile Money" : "Carte bancaire"} · {formatDateTime(p.created_at)}
                    </p>
                  </div>
                  <Badge className={STATUS_COLORS[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                </div>
                {p.provider_reference && (
                  <p className="mt-2 text-xs text-hz-ink/50">Référence : {p.provider_reference}</p>
                )}
                {receipt && <p className="mt-1 text-xs text-hz-ink/50">Reçu n° {receipt.receipt_number}</p>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
