import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { relativeTime } from "@/lib/utils";
import type { ConversationListRow } from "@/lib/data/messages";

export function ConversationList({
  conversations,
  currentUserId,
  basePath,
}: {
  conversations: ConversationListRow[];
  currentUserId: string;
  basePath: string;
}) {
  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="Aucune conversation"
        description="Vos échanges avec les Hôtes ou les clients apparaîtront ici."
      />
    );
  }

  return (
    <div className="divide-y divide-hz-navy/10 rounded-card border border-hz-navy/10 bg-white">
      {conversations.map((c) => {
        const other = c.client?.id === currentUserId ? c.host : c.client;
        const lastMessage = [...c.messages].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        const unread = c.messages.some((m) => m.sender_id !== currentUserId && !m.read_at);

        return (
          <Link key={c.id} href={`${basePath}/${c.id}`} className="flex items-center gap-3 p-4 hover:bg-hz-sky/40">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-hz-navy text-sm font-semibold text-white">
              {other ? `${other.first_name[0] ?? ""}${other.last_name[0] ?? ""}` : "?"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium text-hz-navy">
                  {other ? `${other.first_name} ${other.last_name}` : "Utilisateur"}
                </p>
                <span className="shrink-0 text-xs text-hz-ink/40">{relativeTime(c.last_message_at)}</span>
              </div>
              <p className="truncate text-xs text-hz-ink/50">{c.listing?.title}</p>
              <p className={`truncate text-sm ${unread ? "font-semibold text-hz-navy" : "text-hz-ink/60"}`}>
                {lastMessage?.is_blocked ? "Message bloqué" : lastMessage?.content ?? "Nouvelle conversation"}
              </p>
            </div>
            {unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-hz-gold" />}
          </Link>
        );
      })}
    </div>
  );
}
