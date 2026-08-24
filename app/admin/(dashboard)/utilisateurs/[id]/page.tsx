import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/badge";
import { UserStatusBadge, VerificationStatusBadge, SANCTION_TYPE_LABELS } from "@/components/admin/status-badges";
import { UserStatusActions } from "@/components/admin/user-status-actions";
import { formatDate, formatDateTime, initials } from "@/lib/utils";
import { HOST_TYPE_LABELS } from "@/lib/constants";
import type { Profile, HostProfile, Sanction, Report } from "@/lib/types/database";

export const metadata = { title: "Détail utilisateur" };

export default async function AdminUserDetailPage({ params }: PageProps<"/admin/utilisateurs/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: user } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!user) notFound();

  const [{ data: hostProfile }, { count: listingsCount }, { data: reportsAsAuthor }, { data: reportsAsTarget }, { data: sanctions }] =
    await Promise.all([
      supabase.from("host_profiles").select("*").eq("user_id", id).maybeSingle(),
      supabase.from("listings").select("id", { count: "exact", head: true }).eq("host_id", id),
      supabase.from("reports").select("*").eq("author_id", id).order("created_at", { ascending: false }).limit(20),
      supabase
        .from("reports")
        .select("*")
        .eq("target_type", "user")
        .eq("target_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("sanctions").select("*").eq("user_id", id).order("issued_at", { ascending: false }),
    ]);

  const profile = user as Profile;
  const host = hostProfile as HostProfile | null;

  return (
    <div>
      <Link href="/admin/utilisateurs" className="text-sm font-medium text-hz-blue hover:underline">
        ← Retour aux utilisateurs
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-hz-navy text-lg font-semibold text-white">
            {initials(profile.first_name, profile.last_name)}
          </span>
          <div>
            <h1 className="text-xl font-semibold text-hz-navy">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-sm text-hz-ink/60">
              {profile.email ?? "—"} · {profile.phone ?? "—"}
            </p>
          </div>
        </div>
        <UserStatusActions userId={profile.id} adminId={admin.id} status={profile.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h2 className="font-semibold text-hz-navy">Profil</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-hz-ink/50">Rôle</dt>
              <dd className="capitalize text-hz-ink">{profile.role}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-hz-ink/50">Statut</dt>
              <dd>
                <UserStatusBadge status={profile.status} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-hz-ink/50">Niveau de risque</dt>
              <dd className="capitalize text-hz-ink">{profile.risk_level.replace("_", " ")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-hz-ink/50">Langue</dt>
              <dd className="text-hz-ink">{profile.language}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-hz-ink/50">Inscrit le</dt>
              <dd className="text-hz-ink">{formatDate(profile.created_at)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-hz-ink/50">Annonces</dt>
              <dd className="text-hz-ink">{listingsCount ?? 0}</dd>
            </div>
          </dl>

          {host && (
            <div className="mt-4 border-t border-hz-navy/10 pt-4">
              <p className="text-sm font-medium text-hz-navy">Profil Hôte</p>
              <p className="mt-1 text-sm text-hz-ink/70">{HOST_TYPE_LABELS[host.host_type]}</p>
              <div className="mt-1">
                <VerificationStatusBadge status={host.verification_status} />
              </div>
              <Link href={`/admin/hotes/${host.id}`} className="mt-2 inline-block text-sm font-medium text-hz-blue hover:underline">
                Voir le dossier Hôte →
              </Link>
            </div>
          )}
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <h2 className="font-semibold text-hz-navy">Sanctions</h2>
            {(sanctions ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-hz-ink/50">Aucune sanction enregistrée.</p>
            ) : (
              <ul className="mt-3 divide-y divide-hz-navy/10">
                {(sanctions as Sanction[]).map((s) => (
                  <li key={s.id} className="py-2 text-sm">
                    <p className="font-medium text-hz-navy">{SANCTION_TYPE_LABELS[s.type]}</p>
                    <p className="text-hz-ink/70">{s.reason}</p>
                    <p className="text-xs text-hz-ink/50">{formatDateTime(s.issued_at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-hz-navy">Signalements émis</h2>
            {(reportsAsAuthor ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-hz-ink/50">Aucun signalement émis par cet utilisateur.</p>
            ) : (
              <ul className="mt-3 divide-y divide-hz-navy/10">
                {(reportsAsAuthor as Report[]).map((r) => (
                  <li key={r.id} className="py-2 text-sm">
                    <p className="font-medium text-hz-navy">{r.reason}</p>
                    <p className="text-xs text-hz-ink/50">
                      {r.target_type} · {formatDateTime(r.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-hz-navy">Signalements reçus</h2>
            {(reportsAsTarget ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-hz-ink/50">Aucun signalement contre cet utilisateur.</p>
            ) : (
              <ul className="mt-3 divide-y divide-hz-navy/10">
                {(reportsAsTarget as Report[]).map((r) => (
                  <li key={r.id} className="py-2 text-sm">
                    <p className="font-medium text-hz-navy">{r.reason}</p>
                    <p className="text-xs text-hz-ink/50">{formatDateTime(r.created_at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
