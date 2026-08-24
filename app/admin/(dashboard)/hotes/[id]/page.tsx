import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/badge";
import { VerificationStatusBadge } from "@/components/admin/status-badges";
import { HostApplicationActions } from "@/components/admin/host-application-actions";
import { LISTING_STATUS_LABELS, HOST_TYPE_LABELS, SUBSCRIPTION_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import type { HostProfile, Profile, VerificationDocument, Listing, Subscription } from "@/lib/types/database";

export const metadata = { title: "Dossier Hôte" };

export default async function AdminHostDetailPage({ params }: PageProps<"/admin/hotes/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: hostProfile } = await supabase.from("host_profiles").select("*").eq("id", id).maybeSingle();
  if (!hostProfile) notFound();
  const host = hostProfile as HostProfile;

  const [{ data: user }, { data: documents }, { data: listings }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", host.user_id).maybeSingle(),
    supabase.from("verification_documents").select("*").eq("host_profile_id", host.id).order("uploaded_at", { ascending: false }),
    supabase
      .from("listings")
      .select("id, title, status, price, created_at")
      .eq("host_id", host.user_id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("subscriptions").select("*").eq("host_id", host.user_id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const docsWithUrls = await Promise.all(
    ((documents ?? []) as VerificationDocument[]).map(async (doc) => {
      const { data: signed } = await supabase.storage
        .from("verification-docs")
        .createSignedUrl(doc.storage_path, 60);
      return { doc, url: signed?.signedUrl ?? null };
    })
  );

  const profile = user as Profile | null;

  return (
    <div>
      <Link href="/admin/hotes" className="text-sm font-medium text-hz-blue hover:underline">
        ← Retour aux hôtes
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-hz-navy">
            {profile ? `${profile.first_name} ${profile.last_name}` : "Dossier Hôte"}
          </h1>
          <p className="text-sm text-hz-ink/60">
            {HOST_TYPE_LABELS[host.host_type]} · {profile?.email ?? "—"} · {profile?.phone ?? "—"}
          </p>
        </div>
        <HostApplicationActions
          hostProfileId={host.id}
          adminId={admin.id}
          verificationStatus={host.verification_status}
          badgeVerified={host.badge_verified}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h2 className="font-semibold text-hz-navy">Dossier</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-hz-ink/50">Statut</dt>
              <dd>
                <VerificationStatusBadge status={host.verification_status} />
              </dd>
            </div>
            {host.company_name && (
              <div className="flex justify-between">
                <dt className="text-hz-ink/50">Société</dt>
                <dd className="text-hz-ink">{host.company_name}</dd>
              </div>
            )}
            {host.legal_form && (
              <div className="flex justify-between">
                <dt className="text-hz-ink/50">Forme juridique</dt>
                <dd className="text-hz-ink">{host.legal_form}</dd>
              </div>
            )}
            {host.registration_number && (
              <div className="flex justify-between">
                <dt className="text-hz-ink/50">N° enregistrement</dt>
                <dd className="text-hz-ink">{host.registration_number}</dd>
              </div>
            )}
            {host.age && (
              <div className="flex justify-between">
                <dt className="text-hz-ink/50">Âge</dt>
                <dd className="text-hz-ink">{host.age} ans</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-hz-ink/50">Soumis le</dt>
              <dd className="text-hz-ink">{host.submitted_at ? formatDate(host.submitted_at) : "—"}</dd>
            </div>
            {host.reviewed_at && (
              <div className="flex justify-between">
                <dt className="text-hz-ink/50">Examiné le</dt>
                <dd className="text-hz-ink">{formatDate(host.reviewed_at)}</dd>
              </div>
            )}
            {host.verification_reason && (
              <div className="pt-2">
                <dt className="text-hz-ink/50">Motif de refus</dt>
                <dd className="mt-1 rounded-lg bg-red-50 px-3 py-2 text-red-700">{host.verification_reason}</dd>
              </div>
            )}
          </dl>
          {host.bio && (
            <div className="mt-4 border-t border-hz-navy/10 pt-4">
              <p className="text-sm font-medium text-hz-navy">Présentation</p>
              <p className="mt-1 text-sm text-hz-ink/70">{host.bio}</p>
            </div>
          )}

          {subscription && (
            <div className="mt-4 border-t border-hz-navy/10 pt-4">
              <p className="text-sm font-medium text-hz-navy">Abonnement</p>
              <p className="mt-1 text-sm text-hz-ink/70">
                {SUBSCRIPTION_STATUS_LABELS[(subscription as Subscription).status]} · jusqu&apos;au{" "}
                {formatDate((subscription as Subscription).end_date)}
              </p>
            </div>
          )}
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <h2 className="font-semibold text-hz-navy">Documents de vérification</h2>
            {docsWithUrls.length === 0 ? (
              <p className="mt-2 text-sm text-hz-ink/50">Aucun document téléversé.</p>
            ) : (
              <ul className="mt-3 divide-y divide-hz-navy/10">
                {docsWithUrls.map(({ doc, url }) => (
                  <li key={doc.id} className="flex items-center justify-between py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-hz-ink/40" />
                      <div>
                        <p className="font-medium text-hz-navy">{doc.doc_type}</p>
                        <p className="text-xs text-hz-ink/50">{formatDateTime(doc.uploaded_at)}</p>
                      </div>
                    </div>
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-hz-blue hover:underline"
                      >
                        Voir le document
                      </a>
                    ) : (
                      <span className="text-xs text-hz-ink/40">Indisponible</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-hz-navy">Annonces</h2>
            {(listings ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-hz-ink/50">Aucune annonce publiée.</p>
            ) : (
              <ul className="mt-3 divide-y divide-hz-navy/10">
                {(listings as Pick<Listing, "id" | "title" | "status" | "price" | "created_at">[]).map((l) => (
                  <li key={l.id} className="flex items-center justify-between py-2 text-sm">
                    <Link href={`/admin/annonces/${l.id}`} className="font-medium text-hz-navy hover:underline">
                      {l.title}
                    </Link>
                    <span className="text-xs text-hz-ink/50">
                      {LISTING_STATUS_LABELS[l.status]} · {formatPrice(l.price)}
                    </span>
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
