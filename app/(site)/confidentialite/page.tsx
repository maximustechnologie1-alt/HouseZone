export const metadata = { title: "Confidentialité" };

export default function PrivacyPage() {
  return (
    <div className="hz-container max-w-2xl py-10">
      <h1 className="text-2xl font-semibold text-hz-navy">Confidentialité des données</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-hz-ink/80">
        <p>
          HouseZone collecte les informations nécessaires à la mise en relation immobilière : identité, contact,
          annonces, favoris, demandes de visite, messages et, pour les Hôtes, documents de vérification
          professionnelle.
        </p>
        <p>
          Les documents de vérification (pièce d&apos;identité, registre de commerce...) sont stockés dans un
          espace privé, jamais accessibles publiquement, et consultables uniquement par les équipes autorisées de
          HouseZone.
        </p>
        <p>
          Vos coordonnées personnelles ne sont jamais partagées automatiquement avec un autre utilisateur : les
          échanges passent par la messagerie interne, qui filtre les tentatives de partage de numéro de téléphone,
          email ou identifiant de réseau social pour votre sécurité.
        </p>
        <p>Chaque utilisateur n&apos;accède qu&apos;aux données correspondant à ses droits (Client, Hôte, Administrateur).</p>
      </div>
    </div>
  );
}
