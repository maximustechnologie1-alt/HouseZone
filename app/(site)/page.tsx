import Link from "next/link";
import { Search, ShieldCheck, MapPin, MessageCircleMore } from "lucide-react";
import { QUICK_CATEGORIES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { getFeaturedListings, getUserFavoriteIds } from "@/lib/data/listings";
import { PropertyCard, EmptyState } from "@/components/listings/property-card";
import { Home as HomeIcon } from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();
  const [listings, favoriteIds] = await Promise.all([
    getFeaturedListings(8),
    user ? getUserFavoriteIds(user.id) : Promise.resolve(new Set<string>()),
  ]);

  return (
    <div>
      <section className="bg-hz-navy py-14 text-white sm:py-20">
        <div className="hz-container">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
            Trouvez votre <span className="text-hz-gold">prochain bien</span>.
          </h1>
          <p className="mt-4 max-w-xl text-hz-sky/90">
            Recherchez, vérifiez et visitez un bien immobilier au Burkina Faso — en toute confiance.
          </p>

          <form action="/recherche" className="mt-8 max-w-2xl rounded-2xl bg-white p-2 shadow-lg sm:flex sm:gap-2">
            <div className="flex items-center gap-2 px-3 py-2">
              <Search className="h-5 w-5 shrink-0 text-hz-ink/40" />
              <input
                name="q"
                placeholder="Que recherchez-vous ? (villa, appartement, quartier...)"
                className="w-full text-sm text-hz-ink outline-none placeholder:text-hz-ink/40"
              />
            </div>
            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-hz-blue px-6 py-3 text-sm font-semibold text-white sm:mt-0 sm:w-auto"
            >
              Rechercher
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {QUICK_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/recherche?categorie=${c.slug}`}
                className="rounded-full border border-white/20 px-4 py-1.5 text-sm text-white/90 hover:bg-white/10"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="hz-container py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <Feature icon={ShieldCheck} title="Hôtes vérifiés" text="Un badge signale les professionnels contrôlés par HouseZone." />
          <Feature icon={MapPin} title="Recherche locale" text="Villes et quartiers du Burkina Faso, filtres précis." />
          <Feature icon={MessageCircleMore} title="Messagerie sécurisée" text="Échangez et organisez vos visites sans quitter la plateforme." />
        </div>
      </section>

      <section className="hz-container py-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-hz-navy">Biens récents</h2>
          <Link href="/recherche" className="text-sm font-medium text-hz-blue">
            Voir tout
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {listings.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={HomeIcon}
                title="Aucun bien publié pour l'instant"
                description="Dès qu'un Hôte publie une annonce validée, elle apparaît ici."
              />
            </div>
          ) : (
            listings.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} isFavorite={favoriteIds.has(listing.id)} />
            ))
          )}
        </div>
      </section>

      <section className="hz-container py-10">
        <div className="rounded-card bg-hz-sky p-8 sm:p-12">
          <h2 className="text-xl font-semibold text-hz-navy sm:text-2xl">Vous êtes propriétaire, agence ou démarcheur ?</h2>
          <p className="mt-2 max-w-xl text-sm text-hz-ink/70">
            Publiez vos biens, gérez vos visites et suivez vos statistiques depuis votre espace Hôte. 3 jours
            d&apos;essai gratuit à l&apos;activation.
          </p>
          <Link
            href="/devenir-hote"
            className="mt-5 inline-flex rounded-full bg-hz-navy px-6 py-3 text-sm font-semibold text-white"
          >
            Devenir Hôte
          </Link>
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-card border border-hz-navy/10 p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-hz-blue/10">
        <Icon className="h-5.5 w-5.5 text-hz-blue" />
      </span>
      <p className="mt-3 font-semibold text-hz-navy">{title}</p>
      <p className="mt-1 text-sm text-hz-ink/60">{text}</p>
    </div>
  );
}
