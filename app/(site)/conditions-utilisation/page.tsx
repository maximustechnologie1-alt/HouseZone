export const metadata = { title: "Conditions d'utilisation" };

export default function TermsPage() {
  return (
    <div className="hz-container max-w-2xl py-10">
      <h1 className="text-2xl font-semibold text-hz-navy">Conditions d&apos;utilisation</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-hz-ink/80">
        <p>
          HouseZone est une plateforme de mise en relation immobilière au Burkina Faso. En créant un compte, vous
          acceptez d&apos;utiliser la plateforme exclusivement à des fins immobilières légitimes.
        </p>
        <p>
          Tout compte Client peut demander l&apos;activation d&apos;un profil Hôte (propriétaire, agence,
          démarcheur ou gestionnaire de résidence/meublé), sous réserve de vérification par notre équipe. Les
          documents transmis pour cette vérification restent strictement privés.
        </p>
        <p>
          Il est interdit de publier des annonces frauduleuses, de se faire passer pour un autre utilisateur, de
          contourner la messagerie interne pour échanger des coordonnées personnelles, ou de publier du contenu
          non immobilier. Tout manquement peut entraîner un avertissement, une suspension ou un bannissement du
          compte.
        </p>
        <p>
          Les fonctionnalités professionnelles (publication d&apos;annonces, messagerie complète, avis de
          recherche) sont soumises à un abonnement après la période d&apos;essai gratuit. Un paiement n&apos;est
          considéré comme effectif qu&apos;après confirmation par nos services.
        </p>
        <p>
          HouseZone ne réalise pas directement la vente ou la location définitive d&apos;un bien : la plateforme
          sert à la découverte, la recherche, la mise en relation et l&apos;organisation de visites.
        </p>
      </div>
    </div>
  );
}
