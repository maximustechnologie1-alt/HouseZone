import Link from "next/link";
import { PropertyCard, type PropertyCardData } from "@/components/listings/property-card";

export function FeaturedCarousel({
  listings,
  favoriteIds,
}: {
  listings: PropertyCardData[];
  favoriteIds: Set<string>;
}) {
  if (listings.length === 0) return null;

  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {listings.map((listing) => (
        <div key={listing.id} className="w-64 shrink-0 snap-start sm:w-72">
          <PropertyCard listing={listing} isFavorite={favoriteIds.has(listing.id)} />
        </div>
      ))}
      <Link
        href="/recherche?une=1"
        className="flex w-40 shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-card border border-dashed border-hz-navy/20 text-sm font-medium text-hz-blue hover:bg-hz-sky/40"
      >
        Voir tout →
      </Link>
    </div>
  );
}
