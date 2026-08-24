"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser, requireAdmin } from "@/lib/auth";
import { hostApplicationSchema } from "@/lib/validations";
import { TRIAL_DURATION_DAYS } from "@/lib/constants";
import { createNotification } from "@/lib/notifications/create";
import { createAdminClient } from "@/lib/supabase/admin";
import type { HostType } from "@/lib/types/database";

export interface ActionState {
  error?: string;
}

// Étape 1 : choix du type + informations déclaratives (section 8.2 du CDC).
export async function submitHostApplicationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("/devenir-hote");
  const parsed = hostApplicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  if (parsed.data.hostType === "demarcheur" && (!parsed.data.age || parsed.data.age < 18)) {
    return { error: "Un démarcheur doit avoir au moins 18 ans." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("host_profiles")
    .select("id,verification_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("host_profiles")
      .update({
        host_type: parsed.data.hostType,
        company_name: parsed.data.companyName || null,
        legal_form: parsed.data.legalForm || null,
        registration_number: parsed.data.registrationNumber || null,
        age: parsed.data.age || null,
        bio: parsed.data.bio || null,
        verification_status: "en_cours",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("host_profiles").insert({
      user_id: user.id,
      host_type: parsed.data.hostType,
      company_name: parsed.data.companyName || null,
      legal_form: parsed.data.legalForm || null,
      registration_number: parsed.data.registrationNumber || null,
      age: parsed.data.age || null,
      bio: parsed.data.bio || null,
      verification_status: "en_cours",
      submitted_at: new Date().toISOString(),
    });
  }

  redirect("/devenir-hote/documents");
}

// Étape 2 : upload des documents privés (jamais publics — section 8.4).
export async function uploadVerificationDocumentAction(formData: FormData): Promise<ActionState> {
  const user = await requireUser("/devenir-hote/documents");
  const file = formData.get("file") as File | null;
  const docType = String(formData.get("docType") || "autre");

  if (!file || file.size === 0) return { error: "Sélectionnez un fichier." };

  const supabase = await createClient();
  const { data: hostProfile } = await supabase
    .from("host_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!hostProfile) return { error: "Complétez d'abord le formulaire professionnel." };

  const path = `${user.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from("verification-docs").upload(path, file);
  if (uploadError) return { error: "Échec de l'envoi du document." };

  await supabase.from("verification_documents").insert({
    host_profile_id: hostProfile.id,
    doc_type: docType,
    storage_path: path,
  });

  revalidatePath("/devenir-hote/documents");
  return {};
}

// Étape 3 : soumission finale — passe le dossier en attente de revue admin.
export async function finalizeHostApplicationAction() {
  const user = await requireUser("/devenir-hote/documents");
  const supabase = await createClient();
  await supabase
    .from("host_profiles")
    .update({ verification_status: "en_cours", submitted_at: new Date().toISOString() })
    .eq("user_id", user.id);

  const admin = createAdminClient();
  const { data: admins } = await admin.from("profiles").select("id").eq("role", "admin");
  for (const a of admins ?? []) {
    await createNotification({
      userId: a.id,
      type: "nouvelle_demande_hote",
      title: "Nouvelle demande Hôte",
      body: "Un dossier de vérification Hôte est en attente.",
      link: "/admin/hotes",
    });
  }

  redirect("/devenir-hote/verification");
}

// Admin : accepter une candidature Hôte — passe le profil, l'utilisateur en
// rôle host et démarre l'essai gratuit (section 9 du CDC).
export async function approveHostApplicationAction(hostProfileId: string, adminId: string) {
  adminId = (await requireAdmin()).id;

  const admin = createAdminClient();
  const { data: hostProfile } = await admin
    .from("host_profiles")
    .select("id,user_id,host_type")
    .eq("id", hostProfileId)
    .single();
  if (!hostProfile) return;

  const now = new Date();
  const trialEnd = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await admin
    .from("host_profiles")
    .update({
      verification_status: "accepte",
      reviewed_at: now.toISOString(),
      reviewed_by: adminId,
      trial_started_at: now.toISOString(),
      trial_ends_at: trialEnd.toISOString(),
    })
    .eq("id", hostProfileId);

  await admin.from("profiles").update({ role: "host" }).eq("id", hostProfile.user_id);

  await admin.from("subscriptions").insert({
    host_id: hostProfile.user_id,
    host_type: hostProfile.host_type as HostType,
    status: "essai",
    start_date: now.toISOString(),
    end_date: trialEnd.toISOString(),
  });

  await admin.from("audit_logs").insert({
    admin_id: adminId,
    action: "host_application_approved",
    target_type: "host_profile",
    target_id: hostProfileId,
    target_user_id: hostProfile.user_id,
  });

  await createNotification({
    userId: hostProfile.user_id,
    type: "systeme",
    title: "Votre profil Hôte est activé",
    body: `Votre dossier a été validé. Vous bénéficiez de ${TRIAL_DURATION_DAYS} jours d'essai gratuit.`,
    link: "/espace-hote",
  });

  revalidatePath("/admin/hotes");
}

export async function rejectHostApplicationAction(hostProfileId: string, adminId: string, reason: string) {
  adminId = (await requireAdmin()).id;

  const admin = createAdminClient();
  const { data: hostProfile } = await admin
    .from("host_profiles")
    .select("user_id")
    .eq("id", hostProfileId)
    .single();
  if (!hostProfile) return;

  await admin
    .from("host_profiles")
    .update({
      verification_status: "refuse",
      verification_reason: reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    })
    .eq("id", hostProfileId);

  await admin.from("audit_logs").insert({
    admin_id: adminId,
    action: "host_application_rejected",
    target_type: "host_profile",
    target_id: hostProfileId,
    target_user_id: hostProfile.user_id,
    reason,
  });

  await createNotification({
    userId: hostProfile.user_id,
    type: "systeme",
    title: "Votre demande Hôte a été refusée",
    body: reason,
    link: "/devenir-hote/verification",
  });

  revalidatePath("/admin/hotes");
}
