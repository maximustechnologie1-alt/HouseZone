import { requireUser } from "@/lib/auth";
import { getConversationsForUser } from "@/lib/data/messages";
import { ConversationList } from "@/components/messages/conversation-list";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const user = await requireUser("/messages");
  const conversations = await getConversationsForUser(user.id, "client");

  return (
    <div className="hz-container max-w-2xl py-8">
      <h1 className="text-xl font-semibold text-hz-navy">Messages</h1>
      <div className="mt-6">
        <ConversationList conversations={conversations} currentUserId={user.id} basePath="/messages" />
      </div>
    </div>
  );
}
