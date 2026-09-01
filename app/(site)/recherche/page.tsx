import { SearchX } from "lucide-react";
import { searchListings } from "@/lib/data/listings";
import { getUserFavoriteIds } from "@/lib/data/listings";
import { getCities, getCategories } from "@/lib/data/taxonomies";
import { getCurrentUser } from "@/lib/auth";
import { PropertyCard } from "@/components/listings/property-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchFilters } from "./search-filters";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getServerLocale } from "@/lib/i18n/get-locale";
import { DICTIONARIES } from "@/lib/i18n/registry";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return { title: DICTIONARIES[locale].search.page_title };
}

export default async function SearchPage({ searchParams }: PageProps<"/recherche">) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [user, cities, categories, locale] = await Promise.all([
    getCurrentUser(),
    getCities(),
    getCategories(),
    getServerLocale(),
  ]);
  const t = DICTIONARIES[locale];

  const categoryId = typeof params.categorie === "string"
    ? categories.find((c) => c.id === params.categorie || c.slug === params.categorie)?.id
    : undefined;

  const { listings, total, pageSize } = await searchListings({
    q: typeof params.q === "string" ? params.q : undefined,
    cityId: typeof params.ville === "string" ? params.ville : undefined,
    neighborhoodId: typeof params.quartier === "string" ? params.quartier : undefined,
    categoryId,
    operationType: (params.operation as "location" | "vente" | "reservation") || undefined,
    minPrice: params.prixMin ? Number(params.prixMin) : undefined,
    maxPrice: params.prixMax ? Number(params.prixMax) : undefined,
    bedrooms: params.chambres ? Number(params.chambres) : undefined,
    furnished: params.meuble === "1" ? true : params.meuble === "0" ? false : undefined,
    verifiedHostOnly: params.verifie === "1" ? true : undefined,
    featuredOnly: params.une === "1" ? true : undefined,
    page,
  });

  const favoriteIds = user ? await getUserFavoriteIds(user.id) : new Set<string>();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="hz-container py-8">
      <h1 className="text-xl font-semibold text-hz-navy">{t.search.page_title}</h1>
      <p className="mt-1 text-sm text-hz-ink/60">
        {total} {t.search.results_found}
      </p>

      <div className="mt-4">
        <SearchFilters cities={cities} categories={categories} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={SearchX}
              title={t.search.empty_title}
              description={t.search.empty_description}
              action={
                <Link href="/avis-de-recherche/nouveau" className="text-sm font-medium text-hz-blue">
                  {t.search.empty_cta}
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
