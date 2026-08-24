import { notFound } from "next/navigation";
import Link from "next/link";
import { requireHost } from "@/lib/auth";
import { getConversation, getMessages } from "@/lib/data/messages";
import { markConversationReadAction } from "@/lib/actions/messages";
import { ConversationThread } from "@/components/messages/conversation-thread";

export default async function HostConversationPage({ params }: PageProps<"/espace-hote/messages/[id]">) {
  const { id } = await params;
  const { profile } = await requireHost();
  const conversation = await getConversation(id);

  if (!conversation || conversation.host_id !== profile.id) {
    notFound();
  }

  const messages = await getMessages(id);
  markConversationReadAction(id);

  const other = conversation.client;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-hz-navy">
            {other ? `${other.first_name} ${other.last_name}` : "Conversation"}
          </h1>
          {conversation.listing && (
            <Link href={`/biens/${conversation.listing.id}`} className="text-xs text-hz-blue">
              {conversation.listing.title}
            </Link>
          )}
        </div>
      </div>
      <div className="mt-4 rounded-card border border-hz-navy/10 bg-white">
        <ConversationThread conversationId={id} messages={messages} currentUserId={profile.id} />
      </div>
    </div>
  );
}
