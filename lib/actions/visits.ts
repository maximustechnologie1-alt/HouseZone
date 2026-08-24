"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { visitRequestSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notifications/create";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function requestVisitAction(
  listingId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser(`/biens/${listingId}`);
  const parsed = visitRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id,host_id,title,status")
    .eq("id", listingId)
    .single();

  if (!listing || listing.status !== "active") {
    return { error: "Ce bien n'est plus disponible pour une demande de visite." };
  }

  const { error } = await supabase.from("visit_requests").insert({
    listing_id: listingId,
    client_id: user.id,
    host_id: listing.host_id,
    requested_date: parsed.data.requestedDate,
    requested_time: parsed.data.requestedTime,
    message: parsed.data.message || null,
  });

  if (error) return { error: "Impossible d'envoyer la demande. Réessayez." };

  await createNotification({
    userId: listing.host_id,
    type: "visite_demande",
    title: "Nouvelle demande de visite",
    body: `Une visite est demandée pour « ${listing.title} ».`,
    link: "/espace-hote/visites",
  });

  revalidatePath("/visites");
  return { success: "Votre demande de visite a été envoyée à l'Hôte." };
}

export async function acceptVisitAction(visitId: string) {
  await updateVisitStatus(visitId, "acceptee", "visite_acceptee", "Votre visite a été acceptée.");
}

export async function refuseVisitAction(visitId: string) {
  await updateVisitStatus(visitId, "refusee", "visite_refusee", "Votre visite a été refusée par l'Hôte.");
}

export async function cancelVisitAction(visitId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase
    .from("visit_requests")
    .update({ status: "annulee" })
    .eq("id", visitId)
    .or(`client_id.eq.${user.id},host_id.eq.${user.id}`);
  revalidatePath("/visites");
  revalidatePath("/espace-hote/visites");
}

export async function completeVisitAction(visitId: string) {
  const { host } = await requireVisitParticipant(visitId);
  if (!host) return;
  const supabase = await createClient();
  await supabase.from("visit_requests").update({ status: "terminee" }).eq("id", visitId);
  revalidatePath("/espace-hote/visites");
}

export async function proposeRescheduleAction(
  visitId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const proposedDate = String(formData.get("proposedDate") || "");
  const proposedTime = String(formData.get("proposedTime") || "");
  const hostNote = String(formData.get("hostNote") || "");

  if (!proposedDate || !proposedTime) {
    return { error: "Choisissez une nouvelle date et heure." };
  }

  const supabase = await createClient();
  const { data: visit } = await supabase
    .from("visit_requests")
    .select("id,client_id,host_id,listing_id")
    .eq("id", visitId)
    .eq("host_id", user.id)
    .single();

  if (!visit) return { error: "Demande introuvable." };

  await supabase
    .from("visit_requests")
    .update({
      status: "reprogrammation_proposee",
      proposed_date: proposedDate,
      proposed_time: proposedTime,
      host_note: hostNote || null,
    })
    .eq("id", visitId);

  await createNotification({
    userId: visit.client_id,
    type: "visite_reprogrammee",
    title: "Reprogrammation de visite proposée",
    body: `L'Hôte propose une nouvelle date pour votre visite.`,
    link: "/visites",
  });

  revalidatePath("/espace-hote/visites");
  return { success: "Nouvelle proposition envoyée au client." };
}

async function requireVisitParticipant(visitId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: visit } = await supabase
    .from("visit_requests")
    .select("id,client_id,host_id")
    .eq("id", visitId)
    .single();
  return { user, host: visit?.host_id === user.id, client: visit?.client_id === user.id, visit };
}

async function updateVisitStatus(
  visitId: string,
  status: "acceptee" | "refusee",
  notificationType: "visite_acceptee" | "visite_refusee",
  message: string
) {
  const { host, visit } = await requireVisitParticipant(visitId);
  if (!host || !visit) return;

  const supabase = await createClient();
  await supabase.from("visit_requests").update({ status }).eq("id", visitId);

  await createNotification({
    userId: visit.client_id,
    type: notificationType,
    title: "Mise à jour de votre visite",
    body: message,
    link: "/visites",
  });

  revalidatePath("/espace-hote/visites");
  revalidatePath("/visites");
}
