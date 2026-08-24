import { SearchX } from "lucide-react";
import { searchListings } from "@/lib/data/listings";
import { getUserFavoriteIds } from "@/lib/data/listings";
import { getCities, getCategories } from "@/lib/data/taxonomies";
import { getCurrentUser } from "@/lib/auth";
import { PropertyCard, EmptyState } from "@/components/listings/property-card";
import { SearchFilters } from "./search-filters";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = { title: "Recherche" };

export default async function SearchPage({ searchParams }: PageProps<"/recherche">) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [user, cities, categories] = await Promise.all([getCurrentUser(), getCities(), getCategories()]);

  const categoryId = typeof params.categorie === "string"
    ? categories.find((c) => c.id === params.categorie || c.slug === params.categorie)?.id
    : undefined;

  const { listings, total, pageSize } = await searchListings({
    q: typeof params.q === "string" ? params.q : undefined,
    cityId: typeof params.ville === "string" ? params.ville : undefined,
    categoryId,
    operationType: (params.operation as "location" | "vente" | "reservation") || undefined,
    minPrice: params.prixMin ? Number(params.prixMin) : undefined,
    maxPrice: params.prixMax ? Number(params.prixMax) : undefined,
    bedrooms: params.chambres ? Number(params.chambres) : undefined,
    page,
  });

  const favoriteIds = user ? await getUserFavoriteIds(user.id) : new Set<string>();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="hz-container py-8">
      <h1 className="text-xl font-semibold text-hz-navy">Rechercher un bien</h1>
      <p className="mt-1 text-sm text-hz-ink/60">{total} bien(s) trouvé(s)</p>

      <div className="mt-4">
        <SearchFilters cities={cities} categories={categories} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={SearchX}
              title="Aucun résultat"
              description="Essayez d'élargir vos filtres ou publiez un avis de recherche pour être contacté dès qu'un bien correspond."
              action={
                <Link href="/avis-de-recherche/nouveau" className="text-sm font-medium text-hz-blue">
                  Publier un avis de recherche
                </Link>
              }
            />
          </div>
        ) : (
          listings.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} isFavorite={favoriteIds.has(listing.id)} />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const qs = new URLSearchParams(
              Object.entries(params).flatMap(([k, v]) =>
                v === undefined ? [] : [[k, Array.isArray(v) ? v[0] : v]]
              ) as [string, string][]
            );
            qs.set("page", String(p));
            return (
            <Link
              key={p}
              href={`/recherche?${qs.toString()}`}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm",
                p === page ? "bg-hz-navy text-white" : "text-hz-navy hover:bg-hz-sky"
              )}
            >
              {p}
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
