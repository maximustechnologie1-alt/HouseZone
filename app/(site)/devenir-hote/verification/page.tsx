import { redirect } from "next/navigation";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { requireUser, getHostProfile } from "@/lib/auth";
import { LinkButton } from "@/components/ui/button";

export const metadata = { title: "Vérification en cours" };

export default async function VerificationStatusPage() {
  const user = await requireUser("/devenir-hote/verification");
  const hostProfile = await getHostProfile(user.id);

  if (!hostProfile) redirect("/devenir-hote");

  if (hostProfile.verification_status === "accepte") {
    return (
      <StatusScreen
        icon={CheckCircle2}
        color="text-emerald-600"
        title="Votre profil Hôte est activé !"
        description="Vous pouvez dès maintenant publier vos premiers biens."
        action={<LinkButton href="/espace-hote">Accéder à mon espace Hôte</LinkButton>}
      />
    );
  }

  if (hostProfile.verification_status === "refuse") {
    return (
      <StatusScreen
        icon={XCircle}
        color="text-red-600"
        title="Votre demande a été refusée"
        description={hostProfile.verification_reason || "Contactez le support pour plus d'informations."}
        action={<LinkButton href="/devenir-hote/formulaire">Soumettre un nouveau dossier</LinkButton>}
      />
    );
  }

  return (
    <StatusScreen
      icon={Clock}
      color="text-hz-gold"
      title="Vérification en cours"
      description="Votre dossier est en attente de validation par notre équipe. Vous recevrez une notification dès qu'une décision sera prise."
      action={<LinkButton href="/profil" variant="outline">Retour au profil</LinkButton>}
    />
  );
}

function StatusScreen({
  icon: Icon,
  color,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="hz-container flex max-w-md flex-col items-center py-20 text-center">
      <Icon className={`h-12 w-12 ${color}`} />
      <h1 className="mt-4 text-xl font-semibold text-hz-navy">{title}</h1>
      <p className="mt-2 text-sm text-hz-ink/60">{description}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}
