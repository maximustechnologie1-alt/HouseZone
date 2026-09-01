import Link from "next/link";
import Image from "next/image";
import { Building2, Eye, Heart, Plus } from "lucide-react";
import { requireHost } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { publicListingImageUrl } from "@/lib/data/listings";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { LISTING_STATUS_COLORS, LISTING_STATUS_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { ListingRowActions } from "./listing-row-actions";
import type { Listing } from "@/lib/types/database";

export const metadata = { title: "Mes annonces" };

interface ListingRow extends Listing {
  cities: { name: string } | null;
  listing_images: { storage_path: string; position: number }[];
}

export default async function HostListingsPage() {
  const { profile } = await requireHost();
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*, cities ( name ), listing_images ( storage_path, position )")
    .eq("host_id", profile.id)
    .order("created_at", { ascending: false });

  const listings = (data ?? []) as unknown as ListingRow[];

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-hz-navy">Mes annonces</h1>
          <p className="mt-1 text-sm text-hz-ink/60">Gérez vos biens publiés sur HouseZone.</p>
        </div>
        <LinkButton href="/espace-hote/annonces/nouveau" size="sm">
          <Plus className="h-4 w-4" /> Nouvelle annonce
        </LinkButton>
      </div>

      <div className="mt-6 space-y-3">
        {listings.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Aucune annonce"
            description="Créez votre première annonce pour commencer à recevoir des demandes."
            action={
              <Link href="/espace-hote/annonces/nouveau" className="text-sm font-medium text-hz-blue">
                Créer une annonce
              </Link>
            }
          />
        ) : (
          listings.map((listing) => {
            const cover = [...(listing.listing_images ?? [])].sort((a, b) => a.position - b.position)[0];
            return (
              <div key={listing.id} className="rounded-card border border-hz-navy/10 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-hz-sky">
                    {cover ? (
                      <Image
                        src={publicListingImageUrl(cover.storage_path)}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-hz-navy/30">
                        <Building2 className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/espace-hote/annonces/${listing.id}/modifier`}
                        className="font-medium text-hz-navy hover:underline"
                      >
                        {listing.title}
                      </Link>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${LISTING_STATUS_COLORS[listing.status]}`}>
                        {LISTING_STATUS_LABELS[listing.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-hz-ink/60">
                      {listing.cities?.name} · {formatPrice(listing.price)}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-hz-ink/50">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> {listing.views_count} vues
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" /> {listing.favorites_count} favoris
                      </span>
                    </div>
                    {listing.rejection_reason && (
                      <p className="mt-2 rounded-lg bg-red-50 px-2 py-1 text-xs text-red-700">
                        Motif : {listing.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-hz-navy/10 pt-3">
                  <LinkButton href={`/espace-hote/annonces/${listing.id}/modifier`} variant="outline" size="sm">
                    Modifier
                  </LinkButton>
                  <ListingRowActions listingId={listing.id} status={listing.status} operationType={listing.operation_type} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
