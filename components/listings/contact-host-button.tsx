import { MessageCircle } from "lucide-react";
import { startConversationAction } from "@/lib/actions/messages";
import { Button } from "@/components/ui/button";

export function ContactHostButton({ listingId }: { listingId: string }) {
  const action = startConversationAction.bind(null, listingId);
  return (
    <form action={action}>
      <Button type="submit" variant="outline" size="lg" className="w-full">
        <MessageCircle className="h-4 w-4" /> Contacter l&apos;Hôte
      </Button>
    </form>
  );
}
