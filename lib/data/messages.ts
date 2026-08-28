import { createClient } from "@/lib/supabase/server";

export interface ConversationListRow {
  id: string;
  last_message_at: string;
  listing: { id: string; title: string } | null;
  client: { id: string; first_name: string; last_name: string } | null;
  host: { id: string; first_name: string; last_name: string } | null;
  messages: { content: string; is_blocked: boolean; created_at: string; sender_id: string; read_at: string | null }[];
}

export interface ConversationRow {
  id: string;
  client_id: string;
  host_id: string;
  listing: { id: string; title: string } | null;
  client: { id: string; first_name: string; last_name: string } | null;
  host: { id: string; first_name: string; last_name: string } | null;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  original_content: string | null;
  is_blocked: boolean;
  blocked_reason: string | null;
  read_at: string | null;
  created_at: string;
}

export async function getConversationsForUser(
  userId: string,
  role: "client" | "host"
): Promise<ConversationListRow[]> {
  const supabase = await createClient();
  const column = role === "client" ? "client_id" : "host_id";
  const { data } = await supabase
    .from("conversations")
    .select(
      `id, last_message_at, listing:listings ( id, title ),
       client:profiles!conversations_client_id_fkey ( id, first_name, last_name ),
       host:profiles!conversations_host_id_fkey ( id, first_name, last_name ),
       messages ( content, is_blocked, created_at, sender_id, read_at )`
    )
    .eq(column, userId)
    .order("last_message_at", { ascending: false });

  return (data ?? []) as unknown as ConversationListRow[];
}

export async function getConversation(conversationId: string): Promise<ConversationRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select(
      `id, client_id, host_id, listing:listings ( id, title ),
       client:profiles!conversations_client_id_fkey ( id, first_name, last_name ),
       host:profiles!conversations_host_id_fkey ( id, first_name, last_name )`
    )
    .eq("id", conversationId)
    .maybeSingle();
  return data as unknown as ConversationRow | null;
}

export async function getMessages(conversationId: string): Promise<MessageRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return (data ?? []) as unknown as MessageRow[];
}

// Utilisé pour le badge "Messages" de la navigation (section 10 du cahier
// des charges UX) — compte les messages non lus reçus dans toutes les
// conversations où l'utilisateur est participant, quel que soit son rôle.
export async function getUnreadMessageCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id")
    .or(`client_id.eq.${userId},host_id.eq.${userId}`);

  const conversationIds = (conversations ?? []).map((c) => c.id);
  if (conversationIds.length === 0) return 0;

  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", conversationIds)
    .neq("sender_id", userId)
    .is("read_at", null);

  return count ?? 0;
}
