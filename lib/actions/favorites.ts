"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications/create";

export async function toggleFavoriteAction(listingId: string): Promise<{ favorite: boolean }> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Vous devez être connecté pour ajouter un favori.");
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("favorites")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId);
    revalidatePath("/favoris");
    return { favorite: false };
  }

  await supabase.from("favorites").insert({ user_id: user.id, listing_id: listingId });

  const { data: listing } = await supabase
    .from("listings")
    .select("host_id,title")
    .eq("id", listingId)
    .single();

  if (listing) {
    await createNotification({
      userId: listing.host_id,
      type: "nouveau_favori",
      title: "Nouveau favori",
      body: `Un client a ajouté « ${listing.title} » à ses favoris.`,
      link: `/espace-hote/annonces/${listingId}/modifier`,
    });
  }

  revalidatePath("/favoris");
  return { favorite: true };
}
