import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { HostProfile, Profile } from "@/lib/types/database";

// Memoized per-request: the root layout now resolves the locale (which
// needs the user's saved language) in addition to every existing call site
// (site header, page-level requireUser, etc.) — cache() collapses those
// into a single auth + profile fetch per request instead of one each.
export const getCurrentUser = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return profile;
});

export async function requireUser(next?: string): Promise<Profile> {
  const profile = await getCurrentUser();
  if (!profile) {
    redirect(`/connexion${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }
  // Belt-and-suspenders alongside lib/supabase/proxy.ts's route-level check
  // (RG18: a suspended/banned account loses its features) — this one covers
  // any call site the proxy's matcher doesn't reach.
  if (profile.status !== "active") {
    redirect("/compte-suspendu");
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
