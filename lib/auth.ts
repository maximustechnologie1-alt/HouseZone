import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { HostProfile, Profile } from "@/lib/types/database";

export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return profile;
}

export async function requireUser(next?: string): Promise<Profile> {
  const profile = await getCurrentUser();
  if (!profile) {
    redirect(`/connexion${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireUser();
  if (profile.role !== "admin") {
    redirect("/admin/connexion");
  }
  return profile;
}

export async function getHostProfile(userId: string): Promise<HostProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("host_profiles").select("*").eq("user_id", userId).single();
  return data;
}

export async function requireHost(): Promise<{ profile: Profile; hostProfile: HostProfile }> {
  const profile = await requireUser();
  const hostProfile = await getHostProfile(profile.id);
  if (!hostProfile || hostProfile.verification_status !== "accepte") {
    redirect("/devenir-hote");
  }
  return { profile, hostProfile };
}
