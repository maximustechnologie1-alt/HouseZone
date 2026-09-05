import Image from "next/image";
import Link from "next/link";
import { Building2, CalendarClock, Crown, Eye, Heart, MessageCircle, Plus } from "lucide-react";
import { requireHost } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getHostVisits } from "@/lib/data/visits";
import { getConversationsForUser } from "@/lib/data/messages";
import { SUBSCRIPTION_STATUS_LABELS, HOST_TYPE_LABELS } from "@/lib/constants";
import { formatDate, relativeTime } from "@/lib/utils";
import { LinkButton } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/ui/badge";
import type { Subscription } from "@/lib/types/database";

export const metadata = { title: "Tableau de bord Hôte" };

export default async function HostDashboardPage() {
  const { profile, hostProfile } = await requireHost();
  const supabase = await createClient();

  const [{ data: listings }, visits, conversations, { data: subscription }] = await Promise.all([
    supabase.from("listings").select("id,status,views_count,favorites_count").eq("host_id", profile.id),
    getHostVisits(profile.id),
    getConversationsForUser(profile.id, "host"),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("host_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const subscriptionRow = subscription as Subscription | null;

  const activeListings = (listings ?? []).filter((l) => l.status === "active").length;
  const totalViews = (listings ?? []).reduce((sum, l) => sum + (l.views_count ?? 0), 0);
  const totalFavorites = (listings ?? []).reduce((sum, l) => sum + (l.favorites_count ?? 0), 0);
  const pendingVisits = visits.filter((v) => v.status === "en_attente").length;
  const unreadMessages = conversations.reduce(
    (sum, c) => sum + c.messages.filter((m) => m.sender_id !== profile.id && !m.read_at).length,
    0
  );

  const recentVisits = visits.slice(0, 5).map((v) => ({
    type: "visite" as const,
    date: v.created_at,
    label: `Demande de visite pour « ${v.listing?.title ?? "annonce"} »`,
    status: v.status,
    href: "/espace-hote/visites",
  }));
  const recentMessages = conversations
    .slice(0, 5)
    .map((c) => ({
      type: "message" as const,
      date: c.last_message_at,
      label: `${c.client ? `${c.client.first_name} ${c.client.last_name}` : "Client"} — ${c.listing?.title ?? "conversation"}`,
      href: `/espace-hote/messages/${c.id}`,
    }));
  const recentActivity = [...recentVisits, ...recentMessages]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const stats = [
    { label: "Annonces actives", value: activeListings, icon: Building2 },
    { label: "Vues cumulées", value: totalViews, icon: Eye },
    { label: "Favoris cumulés", value: totalFavorites, icon: Heart },
    { label: "Visites en attente", value: pendingVisits, icon: CalendarClock },
    { label: "Messages non lus", value: unreadMessages, icon: MessageCircle },
  ];

  const memberSince = new Date(profile.created_at).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="rounded-card border border-hz-navy/10 bg-white p-5">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-hz-sky text-lg font-semibold text-hz-navy">
              {profile.first_name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-semibold text-hz-navy">
                {profile.first_name} {profile.last_name}
              </p>
              {hostProfile.badge_verified && <VerifiedBadge />}
            </div>
            <p className="mt-0.5 text-sm text-hz-ink/60 first-letter:uppercase">
              Membre depuis {memberSince}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hz-navy/10 pt-4">
          <span className="flex items-center gap-2 text-sm text-hz-ink/70">
            <Crown className="h-4.5 w-4.5 shrink-0 text-hz-gold" />
            Abonnement {HOST_TYPE_LABELS[hostProfile.host_type]} —{" "}
            <span className="font-medium text-hz-navy">
              {subscriptionRow ? SUBSCRIPTION_STATUS_LABELS[subscriptionRow.status] : "aucun"}
            </span>
            {subscriptionRow && (
              <span className="text-hz-ink/50">· jusqu&apos;au {formatDate(subscriptionRow.end_date)}</span>
            )}
          </span>
          <LinkButton href="/espace-hote/abonnement" variant="outline" size="sm">
            Gérer
          </LinkButton>
        </div>
      </div>

      <LinkButton href="/espace-hote/annonces/nouveau" className="mt-4 w-full">
        <Plus className="h-4.5 w-4.5" /> Publier une annonce
      </LinkButton>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-card border border-hz-navy/10 bg-white p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-hz-blue/10">
              <Icon className="h-4.5 w-4.5 text-hz-blue" strokeWidth={2.25} />
            </span>
            <p className="mt-2 text-2xl font-bold text-hz-navy">{value}</p>
            <p className="text-xs text-hz-ink/60">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-card border border-hz-navy/10 bg-white p-5 lg:col-span-2">
          <h2 className="font-medium text-hz-navy">Activité récente</h2>
          <div className="mt-3 space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-hz-ink/50">Aucune activité pour le moment.</p>
            ) : (
              recentActivity.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 text-sm hover:bg-hz-sky/40"
                >
                  <div className="flex items-center gap-2">
                    {item.type === "visite" ? (
                      <CalendarClock className="h-4 w-4 shrink-0 text-hz-blue" />
                    ) : (
                      <MessageCircle className="h-4 w-4 shrink-0 text-hz-blue" />
                    )}
                    <span className="text-hz-ink/80">{item.label}</span>
                  </div>
                  <span className="shrink-0 text-xs text-hz-ink/40">{relativeTime(item.date)}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-card border border-hz-navy/10 bg-white p-5">
          <h2 className="font-medium text-hz-navy">Abonnement</h2>
          {subscriptionRow ? (
            <>
              <p className="mt-2 text-sm text-hz-ink/70">
                Statut :{" "}
                <span className="font-medium text-hz-navy">{SUBSCRIPTION_STATUS_LABELS[subscriptionRow.status]}</span>
              </p>
              <p className="mt-1 text-xs text-hz-ink/50">
                {subscriptionRow.status === "essai" ? "Fin d'essai" : "Renouvellement"} le{" "}
                {formatDate(subscriptionRow.end_date)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-hz-ink/70">Aucun abonnement actif.</p>
          )}
          <p className="mt-1 text-xs text-hz-ink/50">Type d&apos;Hôte : {HOST_TYPE_LABELS[hostProfile.host_type]}</p>
          <Link href="/espace-hote/abonnement" className="mt-3 inline-block text-sm font-medium text-hz-blue">
            Gérer mon abonnement →
          </Link>
        </div>
      </div>
    </div>
  );
}
