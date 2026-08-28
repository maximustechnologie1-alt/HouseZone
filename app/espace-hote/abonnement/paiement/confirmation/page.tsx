import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { requireHost } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/button";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { SubscriptionPaymentRequest } from "@/lib/types/database";

export const metadata = { title: "Demande envoyée" };

export default async function SubscriptionPaymentConfirmationPage({
  searchParams,
}: PageProps<"/espace-hote/abonnement/paiement/confirmation">) {
  const { profile } = await requireHost();
  const { demande } = await searchParams;
  if (!demande || Array.isArray(demande)) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("subscription_payment_requests")
    .select("*")
    .eq("id", demande)
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!data) notFound();
  const request = data as SubscriptionPaymentRequest;

  return (
    <div className="mx-auto max-w-md text-center">
      <Clock className="mx-auto h-12 w-12 text-hz-gold" />
      <h1 className="mt-4 text-xl font-semibold text-hz-navy">Demande envoyée</h1>
      <p className="mt-2 text-sm text-hz-ink/70">
        Nous avons bien reçu votre preuve de paiement. Votre transaction est actuellement en cours de vérification
        — vous recevrez une notification dès qu&apos;une décision sera prise, généralement sous quelques heures.
      </p>

      <div className="mt-6 rounded-card border border-hz-navy/10 bg-white p-5 text-left text-sm">
        <div className="flex justify-between border-b border-hz-navy/5 pb-2">
          <span className="text-hz-ink/50">Offre</span>
          <span className="font-medium text-hz-navy">
            {request.plan_name} — {request.duration_months} mois
          </span>
        </div>
        <div className="flex justify-between border-b border-hz-navy/5 py-2">
          <span className="text-hz-ink/50">Montant</span>
          <span className="font-medium text-hz-navy">{formatPrice(request.amount)}</span>
        </div>
        <div className="flex justify-between pt-2">
          <span className="text-hz-ink/50">Moyen</span>
          <span className="font-medium text-hz-navy">{PAYMENT_METHOD_LABELS[request.payment_method]}</span>
        </div>
      </div>

      <LinkButton href="/espace-hote/abonnement" className="mt-6 w-full">
        Retour à mon abonnement
      </LinkButton>
    </div>
  );
}
