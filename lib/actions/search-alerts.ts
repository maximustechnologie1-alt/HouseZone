"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { searchAlertSchema } from "@/lib/validations";
import { checkSearchAlertContent } from "@/lib/moderation/search-alert-filter";

export interface ActionState {
  error?: string;
}

export async function createSearchAlertAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("/avis-de-recherche/nouveau");
  const raw = Object.fromEntries(formData);
  const parsed = searchAlertSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const combinedText = `${parsed.data.description} ${parsed.data.characteristics ?? ""}`;
  const { flagged, reason } = checkSearchAlertContent(combinedText);

  const supabase = await createClient();
  const { error } = await supabase.from("search_alerts").insert({
    client_id: user.id,
    category_id: parsed.data.categoryId || null,
    city_id: parsed.data.cityId || null,
    neighborhood_id: parsed.data.neighborhoodId || null,
    budget_min: parsed.data.budgetMin || null,
    budget_max: parsed.data.budgetMax || null,
    characteristics: parsed.data.characteristics || null,
    description: parsed.data.description,
    moderation_flag: flagged,
    status: flagged ? "bloquee" : "active",
  });

  if (error) return { error: "Impossible de publier l'avis de recherche." };

  if (flagged) {
    return {
      error: `Publication refusée : ${reason} Reformulez votre recherche ou contactez le support si vous pensez qu'il s'agit d'une erreur.`,
    };
  }

  revalidatePath("/avis-de-recherche");
  redirect("/avis-de-recherche");
}

export async function closeSearchAlertAction(alertId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from("search_alerts").update({ status: "fermee" }).eq("id", alertId).eq("client_id", user.id);
  revalidatePath("/avis-de-recherche");
}

export async function deleteSearchAlertAction(alertId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from("search_alerts").delete().eq("id", alertId).eq("client_id", user.id);
  revalidatePath("/avis-de-recherche");
}
