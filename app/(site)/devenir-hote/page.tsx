import Link from "next/link";
import { Building2, ShieldCheck, UserRound, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getHostProfile } from "@/lib/auth";
import { LinkButton } from "@/components/ui/button";
import { HOST_TYPE_DESCRIPTIONS, HOST_TYPE_LABELS, TRIAL_DURATION_DAYS } from "@/lib/constants";

export const metadata = { title: "Devenir Hôte" };

export default async function BecomeHostPage() {
  const user = await requireUser("/devenir-hote");
  const hostProfile = await getHostProfile(user.id);

  if (hostProfile?.verification_status === "en_cours" || hostProfile?.verification_status === "refuse") {
    return (
      <div className="hz-container max-w-lg py-16 text-center">
        <p className="text-hz-ink/70">Vous avez déjà une demande en cours.</p>
        <LinkButton href="/devenir-hote/verification" className="mt-4">
          Voir le statut de ma demande
        </LinkButton>
      </div>
    );
  }

  if (hostProfile?.verification_status === "accepte") {
    return (
      <div className="hz-container max-w-lg py-16 text-center">
        <p className="text-hz-ink/70">Votre profil Hôte est déjà actif.</p>
        <LinkButton href="/espace-hote" className="mt-4">
          Accéder à mon espace Hôte
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="hz-container max-w-2xl py-10">
      <h1 className="text-2xl font-semibold text-hz-navy">Devenir Hôte sur HouseZone</h1>
      <p className="mt-2 text-hz-ink/70">
        Publiez vos biens, gérez vos visites et vos échanges. {TRIAL_DURATION_DAYS} jours d&apos;essai gratuit à
        l&apos;activation de votre profil.
      </p>

      <div className="mt-6 rounded-card bg-hz-sky p-5">
        <p className="flex items-center gap-2 text-sm font-medium text-hz-navy">
          <ShieldCheck className="h-5 w-5 text-hz-blue" /> Parcours
        </p>
        <p className="mt-1 text-sm text-hz-ink/70">
          Profil → Type d&apos;Hôte → Formulaire → Documents → Envoi → Vérification par notre équipe.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(["proprietaire", "agence", "demarcheur", "gestionnaire"] as const).map((type) => (
          <div key={type} className="rounded-card border border-hz-navy/10 p-4">
            <p className="flex items-center gap-2 font-medium text-hz-navy">
              <HostTypeIcon type={type} /> {HOST_TYPE_LABELS[type]}
            </p>
            <p className="mt-1 text-xs text-hz-ink/60">{HOST_TYPE_DESCRIPTIONS[type]}</p>
          </div>
        ))}
      </div>

      <LinkButton href="/devenir-hote/formulaire" size="lg" className="mt-8 w-full">
        Commencer
      </LinkButton>
      <p className="mt-3 text-center text-xs text-hz-ink/40">
        <Link href="/profil">Retour au profil</Link>
      </p>
    </div>
  );
}

function HostTypeIcon({ type }: { type: "proprietaire" | "agence" | "demarcheur" | "gestionnaire" }) {
  const icons = { proprietaire: UserRound, agence: Building2, demarcheur: Users, gestionnaire: Building2 };
  const Icon = icons[type];
  return <Icon className="h-4 w-4 text-hz-blue" />;
}
