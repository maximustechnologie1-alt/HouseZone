"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { getPaymentProvider } from "@/lib/payments/provider";
import type { PaymentMethod } from "@/lib/types/database";

export interface ActionState {
  error?: string;
  instructions?: string;
  paymentId?: string;
}

// Choisir une formule → initier un paiement (RG15 : rien n'est activé tant
// que le paiement n'est pas confirmé côté serveur — voir lib/actions/payments.ts).
export async function initiateSubscriptionPaymentAction(
  planId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const method = String(formData.get("method") || "mobile_money") as PaymentMethod;
  const reference = String(formData.get("reference") || "");

  const supabase = await createClient();
  const { data: plan } = await supabase.from("subscription_plans").select("*").eq("id", planId).single();
  if (!plan) return { error: "Formule introuvable." };

  // Statut "suspendu" tant que le paiement n'est pas confirmé : ce n'est ni
  // "essai" ni "actif", donc `is_host_with_active_access()` ne l'accorde pas
  // prématurément (RG15). `confirmPaymentAction` (lib/actions/payments.ts)
  // le fait passer à "actif" une fois le paiement vérifié côté serveur.
  const { data: pendingSubscription } = await supabase
    .from("subscriptions")
    .insert({
      host_id: user.id,
      plan_id: plan.id,
      host_type: plan.host_type,
      status: "suspendu",
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + plan.duration_months * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("id")
    .single();

  if (!pendingSubscription) return { error: "Impossible de créer l'abonnement." };

  const provider = getPaymentProvider();
  const result = await provider.initiate({ amount: plan.price, method, reference });

  const { data: payment } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      subscription_id: pendingSubscription.id,
      amount: plan.price,
      method,
      provider_reference: result.providerReference,
      status: "en_attente",
    })
    .select("id")
    .single();

  revalidatePath("/espace-hote/abonnement");
  redirect(`/espace-hote/paiements?nouveau=${payment?.id}`);
}

export async function toggleAutoRenewAction(subscriptionId: string, autoRenew: boolean) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase
    .from("subscriptions")
    .update({ auto_renew: autoRenew })
    .eq("id", subscriptionId)
    .eq("host_id", user.id);
  revalidatePath("/espace-hote/abonnement");
}

export async function cancelSubscriptionAction(subscriptionId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase
    .from("subscriptions")
    .update({ status: "annule", auto_renew: false })
    .eq("id", subscriptionId)
    .eq("host_id", user.id);
  revalidatePath("/espace-hote/abonnement");
}
