import { MessageCircle } from "lucide-react";
import { startConversationAction } from "@/lib/actions/messages";
import { Button } from "@/components/ui/button";
import { getServerLocale } from "@/lib/i18n/get-locale";
import { DICTIONARIES } from "@/lib/i18n/registry";

export async function ContactHostButton({ listingId }: { listingId: string }) {
  const action = startConversationAction.bind(null, listingId);
  const t = DICTIONARIES[await getServerLocale()];
  return (
    <form action={action}>
      <Button type="submit" variant="outline" size="lg" className="w-full">
        <MessageCircle className="h-4 w-4" /> {t.listing.contact_host}
      </Button>
    </form>
  );
}
