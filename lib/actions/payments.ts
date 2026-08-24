"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications/create";
import { requireAdmin } from "@/lib/auth";

function generateReceiptNumber() {
  const date = new Date();
  const y = date.getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `HZ-${y}-${rand}`;
}

// RG15 : un paiement doit être confirmé côté serveur avant d'activer un
// abonnement — c'est ici que ça se joue, déclenché par un admin depuis
// /admin/paiements après vérification du Mobile Money reçu.
export async function confirmPaymentAction(paymentId: string, adminId: string) {
  // Server Actions are reachable by direct POST request, so the caller-
  // supplied `adminId` can't be trusted — verify the actual session here
  // and use its id for the audit trail instead.
  adminId = (await requireAdmin()).id;

  const admin = createAdminClient();
  const { data: payment } = await admin.from("payments").select("*").eq("id", paymentId).single();
  if (!payment || payment.status === "reussi") return;

  await admin
    .from("payments")
    .update({ status: "reussi", confirmed_by: adminId, confirmed_at: new Date().toISOString() })
    .eq("id", paymentId);

  await admin.from("receipts").insert({ payment_id: paymentId, receipt_number: generateReceiptNumber() });

  if (payment.subscription_id) {
    const { data: subscription } = await admin
      .from("subscriptions")
      .select("id,plan_id")
      .eq("id", payment.subscription_id)
      .single();

    if (subscription?.plan_id) {
      const { data: plan } = await admin
        .from("subscription_plans")
        .select("duration_months")
        .eq("id", subscription.plan_id)
        .single();

      const endDate = new Date(Date.now() + (plan?.duration_months ?? 1) * 30 * 24 * 60 * 60 * 1000);
      await admin
        .from("subscriptions")
        .update({ status: "actif", start_date: new Date().toISOString(), end_date: endDate.toISOString() })
        .eq("id", payment.subscription_id);
    }
  }

  if (payment.booking_id) {
    await admin.from("bookings").update({ status: "confirmee" }).eq("id", payment.booking_id);
  }

  await createNotification({
    userId: payment.user_id,
    type: "paiement_confirme",
    title: "Paiement confirmé",
    body: "Votre paiement a été validé. Merci pour votre confiance.",
    link: "/espace-hote/abonnement",
  });

  await admin.from("audit_logs").insert({
    admin_id: adminId,
    action: "payment_confirmed",
    target_type: "payment",
    target_id: paymentId,
    target_user_id: payment.user_id,
  });

  revalidatePath("/admin/paiements");
  revalidatePath("/espace-hote/abonnement");
  revalidatePath("/espace-hote/paiements");
}

export async function rejectPaymentAction(paymentId: string, adminId: string, reason: string) {
  adminId = (await requireAdmin()).id;

  const admin = createAdminClient();
  const { data: payment } = await admin.from("payments").select("*").eq("id", paymentId).single();
  if (!payment) return;

  await admin.from("payments").update({ status: "echoue", failure_reason: reason }).eq("id", paymentId);

  if (payment.subscription_id) {
    await admin.from("subscriptions").update({ status: "annule" }).eq("id", payment.subscription_id);
  }

  await createNotification({
    userId: payment.user_id,
    type: "systeme",
    title: "Paiement non confirmé",
    body: reason,
    link: "/espace-hote/paiements",
  });

  await admin.from("audit_logs").insert({
    admin_id: adminId,
    action: "payment_rejected",
    target_type: "payment",
    target_id: paymentId,
    target_user_id: payment.user_id,
    reason,
  });

  revalidatePath("/admin/paiements");
}
