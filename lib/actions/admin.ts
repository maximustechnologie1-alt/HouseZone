"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications/create";
import { requireAdmin } from "@/lib/auth";
import type { ReportStatus, RiskLevel, SanctionType, UserStatus } from "@/lib/types/database";

// Every export in this file is a Server Action and therefore reachable by a
// direct POST request, not just from the admin UI. `requireAdmin()` is the
// real authorization check; any `adminId` parameter is caller-supplied and
// only used for display/audit purposes once overwritten with the verified id.

export async function updateUserStatusAction(userId: string, adminId: string, status: UserStatus, reason?: string) {
  adminId = (await requireAdmin()).id;

  const admin = createAdminClient();
  await admin.from("profiles").update({ status }).eq("id", userId);

  if (status !== "active") {
    const sanctionType: SanctionType = status === "banned" ? "bannissement" : "suspension";
    await admin.from("sanctions").insert({
      user_id: userId,
      type: sanctionType,
      reason: reason || "Décision de modération",
      issued_by: adminId,
    });
  }

  await admin.from("audit_logs").insert({
    admin_id: adminId,
    action: `user_status_${status}`,
    target_type: "user",
    target_id: userId,
    target_user_id: userId,
    reason,
  });

  revalidatePath("/admin/utilisateurs");
}

// Le niveau de risque n'est jamais calculé finement (voir lib/moderation/risk.ts
// pour l'escalade automatique légère) : l'admin garde toujours la main pour
// corriger ou surclasser manuellement (section 33 du CDC).
export async function updateRiskLevelAction(userId: string, adminId: string, riskLevel: RiskLevel) {
  adminId = (await requireAdmin()).id;

  const admin = createAdminClient();
  await admin.from("profiles").update({ risk_level: riskLevel }).eq("id", userId);

  await admin.from("audit_logs").insert({
    admin_id: adminId,
    action: "risk_level_updated",
    target_type: "user",
    target_id: userId,
    target_user_id: userId,
    metadata: { risk_level: riskLevel },
  });

  revalidatePath(`/admin/utilisateurs/${userId}`);
}

export async function toggleHostBadgeAction(hostProfileId: string, adminId: string, badgeVerified: boolean) {
  adminId = (await requireAdmin()).id;

  const admin = createAdminClient();
  const { data: hostProfile } = await admin
    .from("host_profiles")
    .select("user_id")
    .eq("id", hostProfileId)
    .single();
  if (!hostProfile) return;

  await admin.from("host_profiles").update({ badge_verified: badgeVerified }).eq("id", hostProfileId);

  await admin.from("audit_logs").insert({
    admin_id: adminId,
    action: badgeVerified ? "badge_granted" : "badge_revoked",
    target_type: "host_profile",
    target_id: hostProfileId,
    target_user_id: hostProfile.user_id,
  });

  await createNotification({
    userId: hostProfile.user_id,
    type: "systeme",
    title: badgeVerified ? "Badge vérifié attribué" : "Badge vérifié retiré",
    body: badgeVerified
      ? "Félicitations, votre profil est désormais certifié HouseZone."
      : "Votre badge vérifié a été retiré par l'administration.",
    link: "/espace-hote/profil",
  });

  revalidatePath("/admin/hotes");
}

export async function suspendHostAction(hostProfileId: string, adminId: string, reason?: string) {
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
    .update({ verification_status: "suspendu", verification_reason: reason || null })
    .eq("id", hostProfileId);

  await admin.from("audit_logs").insert({
    admin_id: adminId,
    action: "host_status_suspended",
    target_type: "host_profile",
    target_id: hostProfileId,
    target_user_id: hostProfile.user_id,
    reason,
  });

  await createNotification({
    userId: hostProfile.user_id,
    type: "systeme",
    title: "Statut Hôte suspendu",
    body: reason || "Votre statut Hôte a été suspendu par l'administration HouseZone.",
    link: "/devenir-hote",
  });

  revalidatePath("/admin/hotes");
  revalidatePath(`/admin/hotes/${hostProfileId}`);
}

export async function reactivateHostAction(hostProfileId: string, adminId: string) {
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
    .update({ verification_status: "accepte", verification_reason: null })
    .eq("id", hostProfileId);

  await admin.from("audit_logs").insert({
    admin_id: adminId,
    action: "host_status_reactivated",
    target_type: "host_profile",
    target_id: hostProfileId,
    target_user_id: hostProfile.user_id,
  });

  await createNotification({
    userId: hostProfile.user_id,
    type: "systeme",
    title: "Statut Hôte réactivé",
    body: "Votre statut Hôte a été réactivé, vous retrouvez l'accès à votre espace professionnel.",
    link: "/espace-hote",
  });

  revalidatePath("/admin/hotes");
  revalidatePath(`/admin/hotes/${hostProfileId}`);
}

export async function resolveReportAction(
  reportId: string,
  adminId: string,
  status: ReportStatus,
  notes?: string
) {
  adminId = (await requireAdmin()).id;

  const admin = createAdminClient();
  await admin
    .from("reports")
    .update({ status, resolution_notes: notes || null, handled_by: adminId, handled_at: new Date().toISOString() })
    .eq("id", reportId);

  await admin.from("audit_logs").insert({
    admin_id: adminId,
    action: `report_${status}`,
    target_type: "report",
    target_id: reportId,
    reason: notes,
  });

  revalidatePath("/admin/signalements");
}

// Section 52 du CDC : clore un signalement "action_effectuee" doit pouvoir
// déclencher la sanction elle-même en un clic, plutôt que d'obliger l'admin
// à naviguer séparément vers la fiche utilisateur pour l'appliquer.
export async function sanctionReportedUserAction(
  reportId: string,
  targetUserId: string,
  adminId: string,
  status: "suspended" | "banned",
  reason?: string
) {
  adminId = (await requireAdmin()).id;

  await updateUserStatusAction(targetUserId, adminId, status, reason || "Sanction suite à un signalement");
  await resolveReportAction(reportId, adminId, "action_effectuee", reason);
}

export async function closeSearchAlertAsAdminAction(alertId: string, adminId: string) {
  adminId = (await requireAdmin()).id;

  const admin = createAdminClient();
  const { data: alert } = await admin.from("search_alerts").select("id,client_id").eq("id", alertId).single();
  if (!alert) return;

  await admin.from("search_alerts").update({ status: "fermee" }).eq("id", alertId);

  await admin.from("audit_logs").insert({
    admin_id: adminId,
    action: "search_alert_closed",
    target_type: "search_alert",
    target_id: alertId,
    target_user_id: alert.client_id,
  });

  revalidatePath("/admin/avis-de-recherche");
}

export async function updateSubscriptionPriceAction(planId: string, price: number, adminId: string) {
  adminId = (await requireAdmin()).id;

  const admin = createAdminClient();
  await admin.from("subscription_plans").update({ price }).eq("id", planId);
  await admin.from("audit_logs").insert({
    admin_id: adminId,
    action: "subscription_plan_price_updated",
    target_type: "subscription_plan",
    target_id: planId,
    metadata: { price },
  });
  revalidatePath("/admin/abonnements");
}

export async function upsertCityAction(adminId: string, name: string, id?: string) {
  await requireAdmin();

  const admin = createAdminClient();
  if (id) await admin.from("cities").update({ name }).eq("id", id);
  else await admin.from("cities").insert({ name });
  revalidatePath("/admin/categories");
}

export async function upsertNeighborhoodAction(cityId: string, name: string, id?: string) {
  await requireAdmin();

  const admin = createAdminClient();
  if (id) await admin.from("neighborhoods").update({ name }).eq("id", id);
  else await admin.from("neighborhoods").insert({ city_id: cityId, name });
  revalidatePath("/admin/categories");
}

export async function toggleCategoryActiveAction(categoryId: string, active: boolean) {
  await requireAdmin();

  const admin = createAdminClient();
  await admin.from("property_categories").update({ active }).eq("id", categoryId);
  revalidatePath("/admin/categories");
}

export async function toggleLanguageActiveAction(code: string, active: boolean) {
  await requireAdmin();

  const admin = createAdminClient();
  await admin.from("languages").update({ active }).eq("code", code);
  revalidatePath("/admin/langues");
}
