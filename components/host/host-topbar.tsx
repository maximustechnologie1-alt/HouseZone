import Link from "next/link";
import { AlertTriangle, Bell } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/utils";
import { VerifiedBadge } from "@/components/ui/badge";
import { HostNavDrawer } from "@/components/host/host-nav-drawer";
import type { HostProfile, Profile } from "@/lib/types/database";

function daysUntil(dateString: string) {
  return Math.ceil((new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export async function HostTopbar({
  profile,
  hostProfile,
  unreadMessages = 0,
}: {
  profile: Profile;
  hostProfile: HostProfile;
  unreadMessages?: number;
}) {
  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status,end_date")
    .eq("host_id", profile.id)
    .order("end_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("is_read", false);

  const daysLeft = subscription ? daysUntil(subscription.end_date) : null;
  const showWarning = subscription && (subscription.status === "essai" || subscription.status === "actif") && daysLeft !== null && daysLeft <= 7;
  const expired = !subscription || subscription.status === "expire" || subscription.status === "annule" || (daysLeft !== null && daysLeft < 0);

  return (
    <div>
      <header className="flex h-16 items-center justify-between border-b border-hz-navy/10 bg-white px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <HostNavDrawer unreadMessages={unreadMessages} />
          <p className="truncate text-sm font-medium text-hz-navy">
            {hostProfile.company_name || `${profile.first_name} ${profile.last_name}`}
          </p>
          {hostProfile.badge_verified && <VerifiedBadge className="hidden shrink-0 sm:inline-flex" />}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/espace-hote" className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-hz-sky">
            <Bell className="h-4.5 w-4.5 text-hz-navy" />
            {Boolean(unreadCount) && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-hz-gold" />}
          </Link>
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-hz-navy text-xs font-semibold text-white">
              {initials(profile.first_name, profile.last_name)}
            </span>
          )}
        </div>
      </header>
      {expired && (
        <div className="flex items-center gap-2 bg-red-50 px-4 py-2 text-xs text-red-700 sm:px-6">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Votre abonnement est expiré. Certaines fonctionnalités sont limitées.
          <Link href="/espace-hote/abonnement" className="font-semibold underline">
            Renouveler
          </Link>
        </div>
      )}
      {!expired && showWarning && (
        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 text-xs text-amber-800 sm:px-6">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {subscription?.status === "essai" ? "Votre essai gratuit" : "Votre abonnement"} se termine dans {daysLeft}{" "}
          jour(s).
          <Link href="/espace-hote/abonnement" className="font-semibold underline">
            Gérer
          </Link>
        </div>
      )}
    </div>
  );
}
