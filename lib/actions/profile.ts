"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validations";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      phone: parsed.data.phone,
      language: parsed.data.language,
    })
    .eq("id", user.id);

  if (error) return { error: "Impossible de mettre à jour le profil." };

  revalidatePath("/profil");
  return { success: "Profil mis à jour." };
}

export async function updateLanguageAction(language: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from("profiles").update({ language }).eq("id", user.id);
  revalidatePath("/profil");
}

export async function togglePushAction(enabled: boolean) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from("profiles").update({ push_enabled: enabled }).eq("id", user.id);
  revalidatePath("/profil/parametres");
}

export async function signOutAllSessionsAction() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
}
