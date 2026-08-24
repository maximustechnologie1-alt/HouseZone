import { requireHost } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { HOST_TYPE_LABELS } from "@/lib/constants";
import { HostProfileForm } from "./host-profile-form";
import type { VerificationDocument } from "@/lib/types/database";

export const metadata = { title: "Profil professionnel" };

const DOC_TYPE_LABELS: Record<string, string> = {
  cni: "Carte nationale d'identité",
  rccm: "Registre du commerce (RCCM)",
  justificatif_domicile: "Justificatif de domicile",
  autre: "Autre document",
};

const VERIFICATION_LABELS: Record<string, string> = {
  non_demande: "Non demandé",
  en_cours: "En cours de vérification",
  accepte: "Vérifié",
  refuse: "Refusé",
};

export default async function HostProfilePage() {
  const { profile, hostProfile } = await requireHost();
  const supabase = await createClient();
  const { data: documents } = await supabase
    .from("verification_documents")
    .select("*")
    .eq("host_profile_id", hostProfile.id);

  const docs = (documents ?? []) as VerificationDocument[];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-hz-navy">Profil professionnel</h1>
        {hostProfile.badge_verified && <VerifiedBadge />}
      </div>

      <div className="mt-6 rounded-card border border-hz-navy/10 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-medium text-hz-navy">
            {profile.first_name} {profile.last_name}
          </span>
          <Badge className="bg-hz-sky text-hz-navy">{HOST_TYPE_LABELS[hostProfile.host_type]}</Badge>
          <Badge className="bg-hz-sky text-hz-navy">
            {VERIFICATION_LABELS[hostProfile.verification_status] ?? hostProfile.verification_status}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-hz-ink/60">{profile.phone}</p>
      </div>

      <div className="mt-6 rounded-card border border-hz-navy/10 bg-white p-5">
        <h2 className="font-medium text-hz-navy">Informations professionnelles</h2>
        <div className="mt-4">
          <HostProfileForm hostProfile={hostProfile} />
        </div>
      </div>

      <div className="mt-6 rounded-card border border-hz-navy/10 bg-white p-5">
        <h2 className="font-medium text-hz-navy">Documents de vérification</h2>
        {docs.length === 0 ? (
          <p className="mt-2 text-sm text-hz-ink/50">Aucun document soumis.</p>
        ) : (
          <ul className="mt-3 divide-y divide-hz-navy/10">
            {docs.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-hz-ink/80">{DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}</span>
                <Badge className="bg-hz-sky text-hz-navy">
                  {VERIFICATION_LABELS[doc.status] ?? doc.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
