import { createAdminClient } from "@/lib/supabase/admin";

// Section 33 du CDC : heuristique légère, pas de moteur anti-fraude avancé
// (explicitement reporté après la V1 par la section 76). Escalade uniquement
// faible → à_surveiller ; la désescalade et les niveaux supérieurs restent
// une décision manuelle de l'admin (app/admin/(dashboard)/utilisateurs/[id]).
const REPORT_THRESHOLD = 3;
const FLAGGED_IMAGE_THRESHOLD = 2;

export async function maybeEscalateRisk(userId: string, reason: string) {
  const admin = createAdminClient();

  const { data: profile } = await admin.from("profiles").select("risk_level").eq("id", userId).maybeSingle();
  if (!profile || profile.risk_level !== "faible") return;

  const [{ count: reportCount }, { data: hostListings }] = await Promise.all([
    admin
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("target_type", "user")
      .eq("target_id", userId),
    admin.from("listings").select("id").eq("host_id", userId),
  ]);

  const listingIds = (hostListings ?? []).map((l) => l.id);
  let flaggedImageCount = 0;
  if (listingIds.length > 0) {
    const { count } = await admin
      .from("listing_images")
      .select("id", { count: "exact", head: true })
      .in("listing_id", listingIds)
      .eq("is_flagged", true);
    flaggedImageCount = count ?? 0;
  }

  if ((reportCount ?? 0) < REPORT_THRESHOLD && flaggedImageCount < FLAGGED_IMAGE_THRESHOLD) return;

  await admin.from("profiles").update({ risk_level: "a_surveiller" }).eq("id", userId);
  await admin.from("audit_logs").insert({
    admin_id: null,
    action: "risk_level_auto_escalated",
    target_type: "user",
    target_id: userId,
    target_user_id: userId,
    reason,
  });
}

// Resolves a listing's host so a report/flag against the listing escalates
// the right account rather than needing the caller to look it up itself.
export async function maybeEscalateRiskForListing(listingId: string, reason: string) {
  const admin = createAdminClient();
  const { data: listing } = await admin.from("listings").select("host_id").eq("id", listingId).maybeSingle();
  if (listing?.host_id) await maybeEscalateRisk(listing.host_id, reason);
}
