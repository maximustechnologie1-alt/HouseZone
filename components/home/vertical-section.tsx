import Link from "next/link";
import { PropertyCard, type PropertyCardData } from "@/components/listings/property-card";

export function VerticalSection({
  title,
  subtitle,
  seeAllHref,
  listings,
  favoriteIds,
  columns = true,
}: {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  listings: PropertyCardData[];
  favoriteIds: Set<string>;
  columns?: boolean;
}) {
  if (listings.length === 0) return null;

  return (
    <section className="hz-container py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-hz-navy">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-hz-ink/60">{subtitle}</p>}
        </div>
        {seeAllHref && (
          <Link href={seeAllHref} className="shrink-0 text-sm font-medium text-hz-blue">
            Voir tout →
          </Link>
        )}
      </div>
      <div className={columns ? "mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" : "mt-5 space-y-4"}>
        {listings.map((listing) => (
          <PropertyCard key={listing.id} listing={listing} isFavorite={favoriteIds.has(listing.id)} />
        ))}
      </div>
    </section>
  );
}
