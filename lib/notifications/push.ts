import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails("mailto:support@housezone.app", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// Section 43 du CDC : Web Push vient en complément des notifications internes
// (jamais à leur place — voir lib/notifications/create.ts) et reste best-effort :
// pas de clés VAPID configurées, pas d'abonnement pour l'utilisateur, ou un
// envoi qui échoue ne doivent jamais faire échouer l'action appelante.
export async function sendPushToUser(userId: string, payload: { title: string; body?: string; url?: string }) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  const admin = createAdminClient();
  const { data: subscriptions } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, keys")
    .eq("user_id", userId);

  await Promise.all(
    (subscriptions ?? []).map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys as { p256dh: string; auth: string } },
          JSON.stringify(payload)
        );
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // Subscription no longer valid (browser unsubscribed, cleared data...).
          await admin.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    })
  );
}
