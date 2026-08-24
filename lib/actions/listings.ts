"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser, requireAdmin } from "@/lib/auth";
import { listingSchema } from "@/lib/validations";
import { analyzeListingImage } from "@/lib/ocr/analyze";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications/create";
import type { ListingFeatures } from "@/lib/types/database";

export interface ActionState {
  error?: string;
  success?: string;
}

const FEATURE_KEYS: (keyof ListingFeatures)[] = [
  "piscine",
  "climatisation",
  "gardien",
  "parking",
  "terrasse",
  "jardin",
  "groupe_electrogene",
  "forage",
  "cloture",
  "internet",
];

function parseFeatures(formData: FormData): ListingFeatures {
  const features: ListingFeatures = {};
  for (const key of FEATURE_KEYS) {
    if (formData.get(`feature_${key}`) === "on") features[key] = true;
  }
  return features;
}

export async function createListingAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = listingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      host_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category_id: parsed.data.categoryId,
      operation_type: parsed.data.operationType,
      price: parsed.data.price,
      city_id: parsed.data.cityId,
      neighborhood_id: parsed.data.neighborhoodId || null,
      address: parsed.data.address || null,
      bedrooms: parsed.data.bedrooms ?? null,
      bathrooms: parsed.data.bathrooms ?? null,
      surface_m2: parsed.data.surfaceM2 ?? null,
      furnished: parsed.data.furnished === "on",
      features: parseFeatures(formData),
      status: "en_attente",
    })
    .select("id")
    .single();

  if (error || !listing) return { error: "Impossible de créer l'annonce." };

  revalidatePath("/espace-hote/annonces");
  redirect(`/espace-hote/annonces/${listing.id}/modifier`);
}

export async function updateListingAction(
  listingId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = listingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("listings")
    .select("id,host_id,status")
    .eq("id", listingId)
    .single();

  if (!existing || existing.host_id !== user.id) return { error: "Annonce introuvable." };

  // Toute modification substantielle repasse l'annonce en attente de
  // validation, sauf si elle était déjà en brouillon.
  const nextStatus = existing.status === "brouillon" ? "brouillon" : "en_attente";

  const { error } = await supabase
    .from("listings")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      category_id: parsed.data.categoryId,
      operation_type: parsed.data.operationType,
      price: parsed.data.price,
      city_id: parsed.data.cityId,
      neighborhood_id: parsed.data.neighborhoodId || null,
      address: parsed.data.address || null,
      bedrooms: parsed.data.bedrooms ?? null,
      bathrooms: parsed.data.bathrooms ?? null,
      surface_m2: parsed.data.surfaceM2 ?? null,
      furnished: parsed.data.furnished === "on",
      features: parseFeatures(formData),
      status: nextStatus,
      rejection_reason: null,
    })
    .eq("id", listingId);

  if (error) return { error: "Impossible de mettre à jour l'annonce." };

  revalidatePath("/espace-hote/annonces");
  revalidatePath(`/biens/${listingId}`);
  return { success: "Annonce mise à jour." };
}

export async function publishListingAction(listingId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id,host_id,status")
    .eq("id", listingId)
    .eq("host_id", user.id)
    .single();

  if (!listing || listing.status !== "brouillon") return;

  await supabase.from("listings").update({ status: "en_attente" }).eq("id", listingId);
  revalidatePath("/espace-hote/annonces");
}

export async function markListingUnavailableAction(listingId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase
    .from("listings")
    .update({ status: "indisponible" })
    .eq("id", listingId)
    .eq("host_id", user.id);
  revalidatePath("/espace-hote/annonces");
}

export async function markListingAvailableAction(listingId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase
    .from("listings")
    .update({ status: "en_attente" })
    .eq("id", listingId)
    .eq("host_id", user.id)
    .eq("status", "indisponible");
  revalidatePath("/espace-hote/annonces");
}

export async function markListingCompletedAction(listingId: string, status: "louee" | "vendue") {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from("listings").update({ status }).eq("id", listingId).eq("host_id", user.id);
  revalidatePath("/espace-hote/annonces");
}

export async function deleteListingAction(listingId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from("listings").delete().eq("id", listingId).eq("host_id", user.id);
  revalidatePath("/espace-hote/annonces");
}

// Upload d'image + analyse OCR (section 28-29 du CDC) : une image contenant
// des coordonnées détectées est marquée refusée et n'apparaît pas côté public.
export async function uploadListingImageAction(listingId: string, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Sélectionnez une image." };

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id,host_id")
    .eq("id", listingId)
    .eq("host_id", user.id)
    .single();
  if (!listing) return { error: "Annonce introuvable." };

  const path = `${user.id}/${listingId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from("listing-images").upload(path, file);
  if (uploadError) return { error: "Échec de l'envoi de l'image." };

  const { count } = await supabase
    .from("listing_images")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);

  const { data: image } = await supabase
    .from("listing_images")
    .insert({ listing_id: listingId, storage_path: path, position: count ?? 0 })
    .select("id")
    .single();

  // Analyse OCR en tâche best-effort — ne bloque pas l'upload si elle échoue.
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await analyzeListingImage(buffer);
    if (image) {
      await supabase
        .from("listing_images")
        .update({
          ocr_status: result.status,
          ocr_flagged_text: result.flaggedReason ?? null,
          is_flagged: result.status === "refuse",
        })
        .eq("id", image.id);

      if (result.status === "refuse") {
        await supabase.from("listings").update({ moderation_flag: true }).eq("id", listingId);
      }
    }
  } catch {
    // L'image reste soumise au contrôle manuel de la modération.
  }

  revalidatePath(`/espace-hote/annonces/${listingId}/modifier`);
  return {};
}

export async function deleteListingImageAction(imageId: string, listingId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id")
    .eq("id", listingId)
    .eq("host_id", user.id)
    .single();
  if (!listing) return;

  const { data: image } = await supabase
    .from("listing_images")
    .select("storage_path")
    .eq("id", imageId)
    .single();

  await supabase.from("listing_images").delete().eq("id", imageId);
  if (image) await supabase.storage.from("listing-images").remove([image.storage_path]);

  revalidatePath(`/espace-hote/annonces/${listingId}/modifier`);
}

// Admin : modération d'annonce (section 30, 51 du CDC).
export async function moderateListingAction(
  listingId: string,
  adminId: string,
  decision: "active" | "refusee" | "bloquee",
  reason?: string
) {
  adminId = (await requireAdmin()).id;

  const admin = createAdminClient();
  const { data: listing } = await admin.from("listings").select("id,host_id,title").eq("id", listingId).single();
  if (!listing) return;

  await admin
    .from("listings")
    .update({
      status: decision,
      rejection_reason: decision === "refusee" || decision === "bloquee" ? reason ?? null : null,
      published_at: decision === "active" ? new Date().toISOString() : undefined,
      moderation_flag: false,
    })
    .eq("id", listingId);

  await admin.from("audit_logs").insert({
    admin_id: adminId,
    action: `listing_${decision}`,
    target_type: "listing",
    target_id: listingId,
    target_user_id: listing.host_id,
    reason,
  });

  await createNotification({
    userId: listing.host_id,
    type: decision === "active" ? "annonce_approuvee" : decision === "refusee" ? "annonce_refusee" : "annonce_bloquee",
    title: decision === "active" ? "Annonce approuvée" : decision === "refusee" ? "Annonce refusée" : "Annonce bloquée",
    body: `« ${listing.title} » ${decision === "active" ? "est maintenant en ligne." : reason ?? ""}`,
    link: "/espace-hote/annonces",
  });

  revalidatePath("/admin/annonces");
}
