"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import type { PaymentMethodType } from "@/lib/types/database";

export interface ActionState {
  error?: string;
  success?: string;
}

// Admin uniquement — Dashboard Admin → Paramètres → Paiements (section 9/34
// du cahier des charges). Les vraies coordonnées de paiement ne sont jamais
// codées en dur : elles sont saisies ici et stockées dans Supabase.
export async function updatePaymentMethodAction(
  method: PaymentMethodType,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();

  const accountName = String(formData.get("accountName") || "").trim();
  const accountNumber = String(formData.get("accountNumber") || "").trim();
  const paymentReference = String(formData.get("paymentReference") || "").trim();
  const paymentInstructions = String(formData.get("paymentInstructions") || "").trim();
  const isActive = formData.get("isActive") === "on";

  if (isActive && (!accountName || !accountNumber)) {
    return {
      error: "Renseignez au minimum le nom du bénéficiaire et le numéro de réception avant d'activer ce moyen.",
    };
  }

  const supabase = createAdminClient();
  const { data: before } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("method", method)
    .single();

  const { error } = await supabase
    .from("payment_methods")
    .update({
      account_name: accountName,
      account_number: accountNumber,
      payment_reference: paymentReference,
      payment_instructions: paymentInstructions,
      is_active: isActive,
      updated_by: admin.id,
    })
    .eq("method", method);

  if (error) return { error: "Impossible d'enregistrer les modifications." };

  await supabase.from("audit_logs").insert({
    admin_id: admin.id,
    action: "ADMIN_UPDATED_PAYMENT_METHOD",
    target_type: "payment_method",
    target_id: method,
    metadata: { before, after: { accountName, accountNumber, paymentReference, isActive } },
  });

  revalidatePath("/admin/parametres/paiements");
  revalidatePath("/espace-hote/abonnement/paiement");
  return { success: "Coordonnées enregistrées." };
}
