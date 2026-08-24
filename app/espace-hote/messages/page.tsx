import { requireHost } from "@/lib/auth";
import { getConversationsForUser } from "@/lib/data/messages";
import { ConversationList } from "@/components/messages/conversation-list";

export const metadata = { title: "Messages" };

export default async function HostMessagesPage() {
  const { profile } = await requireHost();
  const conversations = await getConversationsForUser(profile.id, "host");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-hz-navy">Messages</h1>
      <div className="mt-6">
        <ConversationList conversations={conversations} currentUserId={profile.id} basePath="/espace-hote/messages" />
      </div>
    </div>
  );
}
