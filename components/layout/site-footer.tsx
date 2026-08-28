import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-hz-navy/10 bg-hz-navy py-10 text-hz-sky/80">
      <div className="hz-container flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">HouseZone</p>
          <p className="mt-1 max-w-xs text-sm">Trouvez votre prochain bien.</p>
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
          <div className="flex flex-col gap-2">
            <span className="font-medium text-white">Découvrir</span>
            <Link href="/recherche">Rechercher un bien</Link>
            <Link href="/avis-de-recherche">Avis de recherche</Link>
            <Link href="/devenir-hote">Devenir Hôte</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-medium text-white">Compte</span>
            <Link href="/connexion">Connexion</Link>
            <Link href="/inscription">Inscription</Link>
            <Link href="/profil/parametres">Paramètres</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-medium text-white">Aide</span>
            <Link href="/aide">Centre d&apos;aide</Link>
            <Link href="/aide#contact">Nous contacter</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-medium text-white">Légal</span>
            <Link href="/conditions-utilisation">Conditions d&apos;utilisation</Link>
            <Link href="/confidentialite">Confidentialité</Link>
          </div>
        </div>
      </div>
      <p className="hz-container mt-8 text-xs text-hz-sky/50">
        © {new Date().getFullYear()} HouseZone — Burkina Faso.
      </p>
    </footer>
  );
}
