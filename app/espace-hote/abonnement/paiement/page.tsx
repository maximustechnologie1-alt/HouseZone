import { notFound } from "next/navigation";
import { requireHost } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { PaymentForm } from "./payment-form";

export const metadata = { title: "Paiement de l'abonnement" };

export default async function SubscriptionPaymentPage({
  searchParams,
}: PageProps<"/espace-hote/abonnement/paiement">) {
  await requireHost();
  const { plan: planId } = await searchParams;

  if (!planId || Array.isArray(planId)) notFound();

  const supabase = await createClient();
  const { data: plan } = await supabase.from("subscription_plans").select("*").eq("id", planId).maybeSingle();
  if (!plan) notFound();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-semibold text-hz-navy">Paiement de l&apos;abonnement</h1>

      <div className="mt-4 rounded-card border border-hz-navy/10 bg-white p-5">
        <p className="font-medium text-hz-navy">{plan.name}</p>
        <p className="mt-1 text-2xl font-semibold text-hz-navy">{formatPrice(plan.price)}</p>
        <p className="text-xs text-hz-ink/50">{plan.duration_months} mois</p>
      </div>

      <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
        Le paiement Mobile Money est confirmé manuellement par notre équipe HouseZone. Effectuez le transfert puis
        indiquez la référence de transaction reçue par SMS ; votre abonnement sera activé après vérification.
      </p>

      <div className="mt-6 rounded-card border border-hz-navy/10 bg-white p-5">
        <PaymentForm planId={plan.id} />
      </div>
    </div>
  );
}
