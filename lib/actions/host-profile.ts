"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function updateHostProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const companyName = String(formData.get("companyName") || "").trim();
  const legalForm = String(formData.get("legalForm") || "").trim();
  const registrationNumber = String(formData.get("registrationNumber") || "").trim();
  const bio = String(formData.get("bio") || "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("host_profiles")
    .update({
      company_name: companyName || null,
      legal_form: legalForm || null,
      registration_number: registrationNumber || null,
      bio: bio || null,
    })
    .eq("user_id", user.id);

  if (error) return { error: "Impossible de mettre à jour le profil professionnel." };

  revalidatePath("/espace-hote/profil");
  return { success: "Profil professionnel mis à jour." };
}
