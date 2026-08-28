import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SubscriptionPaymentRequestStatusBadge } from "@/components/admin/status-badges";
import { ApprovePaymentRequestButton, RejectPaymentRequestButton } from "@/components/admin/payment-request-actions";
import { Card } from "@/components/ui/badge";
import { HOST_TYPE_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatDateTime, formatPrice } from "@/lib/utils";
import type { SubscriptionPaymentRequest, Profile } from "@/lib/types/database";

export const metadata = { title: "Vérification du paiement" };

export default async function AdminSubscriptionRequestDetailPage({
  params,
}: PageProps<"/admin/abonnements/demandes/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("subscription_payment_requests")
    .select("*, profiles!subscription_payment_requests_user_id_fkey ( * )")
    .eq("id", id)
    .maybeSingle();

  if (!request) notFound();

  const typedRequest = request as unknown as SubscriptionPaymentRequest & {
    profiles: Profile | Profile[] | null;
  };
  const user = Array.isArray(typedRequest.profiles) ? typedRequest.profiles[0] : typedRequest.profiles;

  const { data: signed } = await supabase.storage
    .from("payment-proofs")
    .createSignedUrl(typedRequest.payment_proof_path, 300);

  const shortId = `HZ-${typedRequest.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/abonnements/demandes" className="text-sm font-medium text-hz-blue hover:underline">
        ← Retour aux demandes
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-xl font-semibold text-hz-navy">Demande #{shortId}</h1>
        <SubscriptionPaymentRequestStatusBadge status={typedRequest.status} />
      </div>

      <Card className="mt-6 p-5">
        <dl className="space-y-3 text-sm">
          <Row label="Utilisateur" value={user ? `${user.first_name} ${user.last_name} (${user.email ?? "—"})` : "—"} />
          <Row label="Type" value={HOST_TYPE_LABELS[typedRequest.host_type]} />
          <Row label="Abonnement" value={`${typedRequest.plan_name} — ${typedRequest.duration_months} mois`} />
          <Row label="Montant" value={formatPrice(typedRequest.amount)} strong />
          <Row label="Moyen" value={PAYMENT_METHOD_LABELS[typedRequest.payment_method]} />
          <Row label="Numéro du payeur" value={typedRequest.payer_phone} />
          <Row
            label="Coordonnées utilisées"
            value={`${typedRequest.payment_account_name} · ${typedRequest.payment_account_number} · ${typedRequest.payment_reference}`}
          />
          <Row label="Date" value={formatDateTime(typedRequest.created_at)} />
          {typedRequest.comment && <Row label="Commentaire" value={typedRequest.comment} />}
          {typedRequest.status === "REJECTED" && typedRequest.rejection_reason && (
            <Row label="Motif du refus" value={typedRequest.rejection_reason} />
          )}
          {typedRequest.status === "APPROVED" && typedRequest.subscription_end && (
            <Row label="Expiration de l'abonnement" value={formatDateTime(typedRequest.subscription_end)} />
          )}
        </dl>
      </Card>

      <Card className="mt-4 p-5">
        <p className="text-sm font-medium text-hz-navy">Preuve de paiement</p>
        {signed?.signedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signed.signedUrl}
            alt="Preuve de paiement"
            className="mt-3 max-h-[480px] w-full rounded-xl border border-hz-navy/10 object-contain"
          />
        ) : (
          <p className="mt-2 text-sm text-hz-ink/50">Impossible de charger la preuve.</p>
        )}
      </Card>

      {typedRequest.status === "PENDING" && (
        <div className="mt-6 flex gap-3">
          <ApprovePaymentRequestButton
            requestId={typedRequest.id}
            amount={typedRequest.amount}
            durationMonths={typedRequest.duration_months}
          />
          <RejectPaymentRequestButton requestId={typedRequest.id} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-hz-navy/5 pb-2 last:border-0 last:pb-0">
      <dt className="shrink-0 text-hz-ink/50">{label}</dt>
      <dd className={strong ? "text-right font-semibold text-hz-navy" : "text-right text-hz-ink"}>{value}</dd>
    </div>
  );
}
