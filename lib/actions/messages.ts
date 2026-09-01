"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { checkMessageContent } from "@/lib/messaging/contact-filter";
import { messageSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notifications/create";
import { hasActiveHostSubscription } from "@/lib/data/subscriptions";

export async function startConversationAction(listingId: string) {
  const user = await requireUser(`/biens/${listingId}`);
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("id,host_id")
    .eq("id", listingId)
    .single();

  if (!listing) redirect(`/biens/${listingId}`);
  if (listing.host_id === user.id) redirect(`/espace-hote/annonces`);

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("client_id", user.id)
    .eq("host_id", listing.host_id)
    .maybeSingle();

  if (existing) redirect(`/messages/${existing.id}`);

  const { data: created } = await supabase
    .from("conversations")
    .insert({ listing_id: listingId, client_id: user.id, host_id: listing.host_id })
    .select("id")
    .single();

  redirect(`/messages/${created?.id}`);
}

export interface ActionState {
  error?: string;
}

export async function sendMessageAction(
  conversationId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = messageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Message vide." };

  const supabase = await createClient();
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id,client_id,host_id,listing_id")
    .eq("id", conversationId)
    .single();

  if (!conversation || (conversation.client_id !== user.id && conversation.host_id !== user.id)) {
    return { error: "Conversation introuvable." };
  }

  if (conversation.host_id === user.id && !(await hasActiveHostSubscription(user.id))) {
    return {
      error: "Votre abonnement a expiré. Renouvelez-le depuis votre espace Hôte pour continuer à échanger avec les clients.",
    };
  }

  const { blocked, reason } = checkMessageContent(parsed.data.content);
  const recipientId = conversation.client_id === user.id ? conversation.host_id : conversation.client_id;

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: blocked
      ? "[Message bloqué : partage de coordonnées non autorisé]"
      : parsed.data.content,
    original_content: blocked ? parsed.data.content : null,
    is_blocked: blocked,
    blocked_reason: blocked ? reason : null,
  });

  if (!blocked) {
    await createNotification({
      userId: recipientId,
      type: "nouveau_message",
      title: "Nouveau message",
      body: parsed.data.content.slice(0, 120),
      link: `/messages/${conversationId}`,
    });
  }

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath(`/espace-hote/messages/${conversationId}`);

  return blocked ? { error: reason } : {};
}

export async function markConversationReadAction(conversationId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .is("read_at", null);
}
