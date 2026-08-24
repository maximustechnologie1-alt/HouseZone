import Image from "next/image";
import Link from "next/link";
import { Bed, MapPin } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/badge";
import { LISTING_STATUS_COLORS, LISTING_STATUS_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { Listing } from "@/lib/types/database";
import { FavoriteButton } from "@/components/listings/favorite-button";

export interface PropertyCardData extends Pick<
  Listing,
  "id" | "title" | "price" | "operation_type" | "status" | "bedrooms" | "furnished"
> {
  cityName?: string;
  neighborhoodName?: string;
  categoryName?: string;
  imageUrl?: string | null;
  hostVerified?: boolean;
}

export function PropertyCard({
  listing,
  isFavorite = false,
  showStatus = false,
}: {
  listing: PropertyCardData;
  isFavorite?: boolean;
  showStatus?: boolean;
}) {
  return (
    <div className="group overflow-hidden rounded-card border border-hz-navy/10 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/biens/${listing.id}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-hz-sky">
          {listing.imageUrl ? (
            <Image
              src={listing.imageUrl}
              alt={listing.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-hz-navy/30">
              <MapPin className="h-8 w-8" />
            </div>
          )}
          {showStatus && (
            <span
              className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium ${LISTING_STATUS_COLORS[listing.status]}`}
            >
              {LISTING_STATUS_LABELS[listing.status]}
            </span>
          )}
          <div className="absolute right-3 top-3">
            <FavoriteButton listingId={listing.id} initialFavorite={isFavorite} />
          </div>
        </div>
      </Link>
      <Link href={`/biens/${listing.id}`} className="block p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-hz-navy">{formatPrice(listing.price)}</p>
          {listing.operation_type === "location" && <span className="text-xs text-hz-ink/50">/mois</span>}
        </div>
        <p className="mt-1 line-clamp-1 text-sm font-medium text-hz-ink">{listing.title}</p>
        <div className="mt-2 flex items-center gap-1 text-xs text-hz-ink/60">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">
            {listing.neighborhoodName ? `${listing.neighborhoodName}, ` : ""}
            {listing.cityName}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-hz-ink/60">
            {listing.categoryName && <span>{listing.categoryName}</span>}
            {listing.bedrooms ? (
              <span className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5" /> {listing.bedrooms}
              </span>
            ) : null}
          </div>
          {listing.hostVerified && <VerifiedBadge />}
        </div>
      </Link>
    </div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-hz-navy/10 bg-white">
      <div className="aspect-[4/3] animate-pulse bg-hz-sky" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-1/2 animate-pulse rounded bg-hz-sky" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-hz-sky" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-hz-sky" />
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-hz-navy/15 px-6 py-16 text-center">
      <Icon className="h-8 w-8 text-hz-navy/30" />
      <p className="font-medium text-hz-navy">{title}</p>
      <p className="max-w-sm text-sm text-hz-ink/60">{description}</p>
      {action}
    </div>
  );
}
