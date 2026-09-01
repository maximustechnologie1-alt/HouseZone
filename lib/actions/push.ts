"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function subscribeToPushAction(subscription: PushSubscriptionInput) {
  const user = await requireUser();
  const supabase = await createClient();

  await supabase.from("push_subscriptions").upsert(
    { user_id: user.id, endpoint: subscription.endpoint, keys: subscription.keys },
    { onConflict: "endpoint" }
  );
  await supabase.from("profiles").update({ push_enabled: true }).eq("id", user.id);

  revalidatePath("/profil/parametres");
}

export async function unsubscribeFromPushAction(endpoint: string) {
  const user = await requireUser();
  const supabase = await createClient();

  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("user_id", user.id);
  const { count } = await supabase
    .from("push_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (!count) {
    await supabase.from("profiles").update({ push_enabled: false }).eq("id", user.id);
  }

  revalidatePath("/profil/parametres");
}
