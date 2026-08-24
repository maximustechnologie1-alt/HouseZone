import Link from "next/link";
import { Building2, CalendarClock, Eye, Heart, MessageCircle } from "lucide-react";
import { requireHost } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getHostVisits } from "@/lib/data/visits";
import { getConversationsForUser } from "@/lib/data/messages";
import { SUBSCRIPTION_STATUS_LABELS, HOST_TYPE_LABELS } from "@/lib/constants";
import { formatDate, relativeTime } from "@/lib/utils";
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

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">
        Bonjour {profile.first_name}
      </h1>
      <p className="mt-1 text-sm text-hz-ink/60">Voici un aperçu de votre activité sur HouseZone.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-card border border-hz-navy/10 bg-white p-4">
            <Icon className="h-5 w-5 text-hz-blue" />
            <p className="mt-2 text-2xl font-semibold text-hz-navy">{value}</p>
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
