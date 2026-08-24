import { notFound } from "next/navigation";
import { requireHost } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCities, getNeighborhoods, getCategories } from "@/lib/data/taxonomies";
import { ListingForm } from "@/components/listings/listing-form";
import { ListingImageManager } from "@/components/listings/listing-image-manager";
import { updateListingAction } from "@/lib/actions/listings";
import { LISTING_STATUS_COLORS, LISTING_STATUS_LABELS } from "@/lib/constants";
import type { Listing, ListingImage } from "@/lib/types/database";

export const metadata = { title: "Modifier l'annonce" };

export default async function EditListingPage({ params }: PageProps<"/espace-hote/annonces/[id]/modifier">) {
  const { id } = await params;
  const { profile } = await requireHost();
  const supabase = await createClient();

  const { data: listing } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
  if (!listing || (listing as Listing).host_id !== profile.id) notFound();

  const typedListing = listing as Listing;

  const [cities, neighborhoods, categories, { data: images }] = await Promise.all([
    getCities(),
    getNeighborhoods(),
    getCategories(),
    supabase.from("listing_images").select("*").eq("listing_id", id).order("position"),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-hz-navy">Modifier l&apos;annonce</h1>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${LISTING_STATUS_COLORS[typedListing.status]}`}>
          {LISTING_STATUS_LABELS[typedListing.status]}
        </span>
      </div>
      {typedListing.rejection_reason && (typedListing.status === "refusee" || typedListing.status === "bloquee") && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Motif : {typedListing.rejection_reason}
        </p>
      )}

      <div className="mt-6 rounded-card border border-hz-navy/10 bg-white p-5">
        <ListingForm
          action={updateListingAction.bind(null, id)}
          cities={cities}
          neighborhoods={neighborhoods}
          categories={categories}
          listing={typedListing}
        />
      </div>

      <div className="mt-6 rounded-card border border-hz-navy/10 bg-white p-5">
        <h2 className="font-medium text-hz-navy">Photos</h2>
        <div className="mt-3">
          <ListingImageManager listingId={id} images={(images ?? []) as ListingImage[]} />
        </div>
      </div>
    </div>
  );
}
