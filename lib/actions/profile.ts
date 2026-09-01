"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validations";
import { LOCALE_COOKIE } from "@/lib/i18n/locale-cookie";
import { isLocaleCode } from "@/lib/i18n/locales";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "auth.invalid_form" };
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

  if (error) return { error: "profile.update_error" };

  revalidatePath("/profil");
  return { success: "profile.update_success" };
}

export async function updateLanguageAction(language: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from("profiles").update({ language }).eq("id", user.id);

  // Mirrors the choice into the cookie too, so a guest who later signs in
  // (or a full page reload) resolves to the same locale server-side without
  // waiting on the profile round trip — see lib/i18n/get-locale.ts.
  if (isLocaleCode(language)) {
    const cookieStore = await cookies();
    cookieStore.set(LOCALE_COOKIE, language, { path: "/", maxAge: 31536000, sameSite: "lax" });
  }

  revalidatePath("/", "layout");
  revalidatePath("/profil");
}

export async function signOutAllSessionsAction() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
}
