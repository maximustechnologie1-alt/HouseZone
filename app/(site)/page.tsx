import Link from "next/link";
import { ShieldCheck, MapPin as MapPinIcon, MessageCircleMore, Home as HomeIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  getFeaturedListings,
  getUserFavoriteIds,
  getTopFeaturedListings,
  getListingsByCategorySlugs,
  getListingsByCategory,
} from "@/lib/data/listings";
import { getCities, getNeighborhoods, getCategories } from "@/lib/data/taxonomies";
import { EmptyState } from "@/components/ui/empty-state";
import { HeroSearchBar } from "@/components/home/hero-search-bar";
import { CategoryScroller } from "@/components/home/category-scroller";
import { FeaturedCarousel } from "@/components/home/featured-carousel";
import { VerticalSection } from "@/components/home/vertical-section";
import { NearbySection } from "@/components/home/nearby-section";

export default async function HomePage() {
  const user = await getCurrentUser();

  const [cities, neighborhoods, categories] = await Promise.all([
    getCities(),
    getNeighborhoods(),
    getCategories(),
  ]);

  const [featured, recent, residences, appartements, meubles, villas, terrains, favoriteIds] = await Promise.all([
    getTopFeaturedListings(10),
    getFeaturedListings(6),
    getListingsByCategorySlugs(["residence", "residence-meublee"], 4),
    getListingsByCategorySlugs(["appartement", "appartement-meuble"], 4),
    getListingsByCategorySlugs(["appartement-meuble", "residence-meublee"], 4),
    getListingsByCategorySlugs(["villa", "mini-villa"], 4),
    getListingsByCategory("terrain", 4),
    user ? getUserFavoriteIds(user.id) : Promise.resolve(new Set<string>()),
  ]);

  const nothingPublished =
    featured.length === 0 &&
    recent.length === 0 &&
    residences.length === 0 &&
    appartements.length === 0 &&
    meubles.length === 0 &&
    villas.length === 0 &&
    terrains.length === 0;

  return (
    <div>
      <section className="bg-hz-navy pb-6 pt-5 sm:pb-12 sm:pt-10">
        <div className="hz-container">
          <p className="mb-4 text-balance text-lg font-semibold leading-snug text-white sm:text-2xl">
            Trouvez votre <span className="text-hz-gold">prochain bien</span>.
          </p>
          <HeroSearchBar cities={cities} neighborhoods={neighborhoods} categories={categories} />
        </div>
      </section>

      <section className="hz-container -mt-2 py-4 sm:py-6">
        <CategoryScroller categories={categories} />
      </section>

      {nothingPublished ? (
        <section className="hz-container py-4 sm:py-8">
          <EmptyState
            icon={HomeIcon}
            title="Aucun bien publié pour l'instant"
            description="Dès qu'un Hôte publie une annonce validée, elle apparaît ici."
          />
        </section>
      ) : (
        <>
          <section className="hz-container py-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-hz-navy">Top résidences &amp; appartements à la une</h2>
                <p className="mt-1 text-sm text-hz-ink/60">Découvrez les biens les plus remarqués sur HouseZone</p>
              </div>
              <Link href="/recherche?une=1" className="shrink-0 text-sm font-medium text-hz-blue">
                Voir tout →
              </Link>
            </div>
            <div className="mt-5">
              <FeaturedCarousel listings={featured} favoriteIds={favoriteIds} />
            </div>
          </section>

          <VerticalSection
            title="Nouvelles annonces"
            seeAllHref="/recherche"
            listings={recent}
            favoriteIds={favoriteIds}
          />

          <NearbySection favoriteIds={favoriteIds} />

          <VerticalSection
            title="Résidences"
            seeAllHref="/recherche?categorie=residence"
            listings={residences}
            favoriteIds={favoriteIds}
          />

          <VerticalSection
            title="Appartements"
            seeAllHref="/recherche?categorie=appartement"
            listings={appartements}
            favoriteIds={favoriteIds}
          />

          <VerticalSection
            title="Appartements meublés"
            seeAllHref="/recherche?meuble=1"
            listings={meubles}
            favoriteIds={favoriteIds}
          />

          <VerticalSection
            title="Villas"
            seeAllHref="/recherche?categorie=villa"
            listings={villas}
            favoriteIds={favoriteIds}
          />

          <VerticalSection
            title="Terrains"
            seeAllHref="/recherche?categorie=terrain"
            listings={terrains}
            favoriteIds={favoriteIds}
          />
        </>
      )}

      <section className="hz-container py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Feature
            icon={ShieldCheck}
            title="Hôtes vérifiés"
            text="Un badge signale les professionnels contrôlés par HouseZone."
          />
          <Feature icon={MapPinIcon} title="Recherche locale" text="Villes et quartiers du Burkina Faso, filtres précis." />
          <Feature
            icon={MessageCircleMore}
            title="Messagerie sécurisée"
            text="Échangez et organisez vos visites sans quitter la plateforme."
          />
        </div>
      </section>

      <section className="hz-container pb-10">
        <div className="rounded-card bg-hz-sky p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-hz-navy">Propriétaire, agence ou démarcheur ?</h2>
              <p className="mt-1 max-w-md text-sm text-hz-ink/70">
                Publiez vos biens et gérez vos visites depuis votre espace Hôte. 3 jours d&apos;essai gratuit.
              </p>
            </div>
            <Link
              href="/devenir-hote"
              className="shrink-0 rounded-full bg-hz-navy px-5 py-2.5 text-sm font-semibold text-white"
            >
              Devenir Hôte
            </Link>
          </div>
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
