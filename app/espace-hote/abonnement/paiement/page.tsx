import { notFound } from "next/navigation";
import { requireHost } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getActivePaymentMethods } from "@/lib/data/payment-methods";
import { formatPrice } from "@/lib/utils";
import { SubscriptionPaymentFlow } from "./subscription-payment-flow";

export const metadata = { title: "Paiement de l'abonnement" };

export default async function SubscriptionPaymentPage({
  searchParams,
}: PageProps<"/espace-hote/abonnement/paiement">) {
  await requireHost();
  const { plan: planId } = await searchParams;

  if (!planId || Array.isArray(planId)) notFound();

  const supabase = await createClient();
  const [{ data: plan }, methods] = await Promise.all([
    supabase.from("subscription_plans").select("*").eq("id", planId).maybeSingle(),
    getActivePaymentMethods(),
  ]);
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
        Le paiement Mobile Money est vérifié manuellement par notre équipe. Votre abonnement est activé uniquement
        après confirmation du transfert par un administrateur — jamais automatiquement.
      </p>

      <div className="mt-6 rounded-card border border-hz-navy/10 bg-white p-5">
        <SubscriptionPaymentFlow planId={plan.id} amount={plan.price} methods={methods} />
      </div>
    </div>
  );
}
