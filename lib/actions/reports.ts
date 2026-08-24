"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { reportSchema } from "@/lib/validations";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function createReportAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = reportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    author_id: user.id,
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    reason: parsed.data.reason,
    comment: parsed.data.comment || null,
  });

  if (error) return { error: "Impossible d'envoyer le signalement." };
  return { success: "Merci, votre signalement a été transmis à notre équipe de modération." };
}
