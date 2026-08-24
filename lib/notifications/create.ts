import { createAdminClient } from "@/lib/supabase/admin";
import type { NotificationType } from "@/lib/types/database";

// Deliberately NOT a Server Action (no "use server" in this file): it's an
// internal helper only ever called from other Server Actions / Server
// Components, and it writes with the service-role client. If this were
// exported from a "use server" file it would become directly callable by
// anyone via a raw POST request, letting them spam arbitrary notifications
// (including arbitrary `link` values) to any user — see lib/actions/notifications.ts
// for the two functions that DO need to be public Server Actions.
export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}) {
  const supabase = createAdminClient();
  await supabase.from("notifications").insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    link: input.link,
  });
}
