"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireHost, requireAdmin } from "@/lib/auth";
import { createNotification } from "@/lib/notifications/create";
import type { PaymentMethodType } from "@/lib/types/database";

export interface ActionState {
  error?: string;
  success?: string;
}

function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `HZ-${year}-${rand}`;
}

// Étape finale du parcours Hôte : "J'ai effectué le paiement" → preuve →
// création de la demande (status PENDING). Le montant et les coordonnées de
// paiement sont récupérés côté serveur (jamais depuis le formulaire), pour
// qu'un utilisateur ne puisse jamais falsifier le montant ou le bénéficiaire
// (section 36 du cahier des charges).
export async function submitSubscriptionPaymentRequestAction(
  planId: string,
  method: PaymentMethodType,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { profile: user } = await requireHost();
  const payerPhone = String(formData.get("payerPhone") || "").trim();
  const comment = String(formData.get("comment") || "").trim();
  const proof = formData.get("proof") as File | null;

  if (!payerPhone) return { error: "Indiquez le numéro utilisé pour effectuer le transfert." };
  if (!proof || proof.size === 0) return { error: "Joignez une capture d'écran de la preuve de paiement." };

  const supabase = await createClient();

  const { data: plan } = await supabase.from("subscription_plans").select("*").eq("id", planId).single();
  if (!plan) return { error: "Formule introuvable." };

  const { data: paymentMethod } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("method", method)
    .eq("is_active", true)
    .maybeSingle();
  if (!paymentMethod) return { error: "Ce moyen de paiement n'est plus disponible." };

  const proofPath = `${user.id}/${Date.now()}-${proof.name}`;
  const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(proofPath, proof);
  if (uploadError) return { error: "Échec de l'envoi de la preuve de paiement." };

  const { data: request, error } = await supabase
    .from("subscription_payment_requests")
    .insert({
      user_id: user.id,
      host_type: plan.host_type,
      subscription_plan_id: plan.id,
      plan_name: plan.name,
      duration_months: plan.duration_months,
      amount: plan.price,
      payment_mode: "MANUAL",
      payment_method: method,
      payer_phone: payerPhone,
      payment_proof_path: proofPath,
      comment: comment || null,
      payment_account_name: paymentMethod.account_name,
      payment_account_number: paymentMethod.account_number,
      payment_reference: paymentMethod.payment_reference,
      status: "PENDING",
    })
    .select("id")
    .single();

  if (error || !request) return { error: "Impossible d'envoyer votre demande. Réessayez." };

  const admin = createAdminClient();
  const { data: admins } = await admin.from("profiles").select("id").eq("role", "admin");
  for (const a of admins ?? []) {
    await createNotification({
      userId: a.id,
      type: "systeme",
      title: "🔔 Nouvelle demande d'abonnement",
      body: `${plan.name} — ${plan.price.toLocaleString("fr-FR")} FCFA · ${paymentMethod.display_name} · En attente`,
      link: `/admin/abonnements/demandes/${request.id}`,
    });
  }

  revalidatePath("/espace-hote/abonnement");
  redirect(`/espace-hote/abonnement/paiement/confirmation?demande=${request.id}`);
}

export async function cancelSubscriptionPaymentRequestAction(requestId: string) {
  const { profile: user } = await requireHost();
  const supabase = await createClient();
  const { data: request } = await supabase
    .from("subscription_payment_requests")
    .select("id,user_id,status")
    .eq("id", requestId)
    .single();

  if (!request || request.user_id !== user.id || request.status !== "PENDING") return;

  // Pas de policy UPDATE pour les utilisateurs (section 36) : l'annulation
  // passe par le client service-role après vérification d'appartenance et
  // de statut ci-dessus.
  const admin = createAdminClient();
  await admin.from("subscription_payment_requests").update({ status: "CANCELLED" }).eq("id", requestId);

  revalidatePath("/espace-hote/abonnement");
}

// Admin — approbation (sections 21-25). Active l'abonnement, calcule les
// dates, journalise, notifie.
export async function approveSubscriptionPaymentRequestAction(requestId: string) {
  const admin = await requireAdmin();
  const client = createAdminClient();

  const { data: request } = await client
    .from("subscription_payment_requests")
    .select("*")
    .eq("id", requestId)
    .single();
  if (!request || request.status !== "PENDING") return;

  const now = new Date();
  const end = new Date(now.getTime() + request.duration_months * 30 * 24 * 60 * 60 * 1000);

  const { data: subscription } = await client
    .from("subscriptions")
    .insert({
      host_id: request.user_id,
      plan_id: request.subscription_plan_id,
      host_type: request.host_type,
      status: "actif",
      start_date: now.toISOString(),
      end_date: end.toISOString(),
    })
    .select("id")
    .single();

  const { data: payment } = await client
    .from("payments")
    .insert({
      user_id: request.user_id,
      subscription_id: subscription?.id ?? null,
      amount: request.amount,
      method: "mobile_money",
      provider_reference: request.payment_reference || request.id,
      status: "reussi",
      confirmed_by: admin.id,
      confirmed_at: now.toISOString(),
    })
    .select("id")
    .single();

  if (payment) {
    await client.from("receipts").insert({ payment_id: payment.id, receipt_number: generateReceiptNumber() });
  }

  await client
    .from("subscription_payment_requests")
    .update({
      status: "APPROVED",
      reviewed_by: admin.id,
      reviewed_at: now.toISOString(),
      subscription_id: subscription?.id ?? null,
      subscription_start: now.toISOString(),
      subscription_end: end.toISOString(),
    })
    .eq("id", requestId);

  await client.from("audit_logs").insert({
    admin_id: admin.id,
    action: "ADMIN_APPROVED_PAYMENT",
    target_type: "subscription_payment_request",
    target_id: requestId,
    target_user_id: request.user_id,
    metadata: { amount: request.amount, plan_name: request.plan_name },
  });

  await createNotification({
    userId: request.user_id,
    type: "paiement_confirme",
    title: "🎉 Paiement confirmé !",
    body: `${request.plan_name} — Début ${now.toLocaleDateString("fr-FR")}, expiration ${end.toLocaleDateString("fr-FR")}. Vos fonctionnalités professionnelles sont actives.`,
    link: "/espace-hote/abonnement",
  });

  revalidatePath("/admin/abonnements");
  revalidatePath("/admin/abonnements/demandes");
  revalidatePath("/espace-hote/abonnement");
}

export async function rejectSubscriptionPaymentRequestAction(requestId: string, reason: string) {
  const admin = await requireAdmin();
  const client = createAdminClient();

  const { data: request } = await client
    .from("subscription_payment_requests")
    .select("id,user_id,status,plan_name")
    .eq("id", requestId)
    .single();
  if (!request || request.status !== "PENDING") return;

  await client
    .from("subscription_payment_requests")
    .update({
      status: "REJECTED",
      rejection_reason: reason,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  await client.from("audit_logs").insert({
    admin_id: admin.id,
    action: "ADMIN_REJECTED_PAYMENT",
    target_type: "subscription_payment_request",
    target_id: requestId,
    target_user_id: request.user_id,
    reason,
  });

  await createNotification({
    userId: request.user_id,
    type: "systeme",
    title: "❌ Paiement non confirmé",
    body: `Votre demande pour « ${request.plan_name} » n'a pas été validée. Motif : ${reason}. Vous pouvez effectuer une nouvelle demande.`,
    link: "/espace-hote/abonnement",
  });

  revalidatePath("/admin/abonnements");
  revalidatePath("/admin/abonnements/demandes");
}
