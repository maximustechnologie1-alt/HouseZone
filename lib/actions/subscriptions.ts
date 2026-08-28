"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function toggleAutoRenewAction(subscriptionId: string, autoRenew: boolean) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase
    .from("subscriptions")
    .update({ auto_renew: autoRenew })
    .eq("id", subscriptionId)
    .eq("host_id", user.id);
  revalidatePath("/espace-hote/abonnement");
}

export async function cancelSubscriptionAction(subscriptionId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase
    .from("subscriptions")
    .update({ status: "annule", auto_renew: false })
    .eq("id", subscriptionId)
    .eq("host_id", user.id);
  revalidatePath("/espace-hote/abonnement");
}
