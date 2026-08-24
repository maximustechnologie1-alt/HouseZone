import { requireHost } from "@/lib/auth";
import { getCities, getNeighborhoods, getCategories } from "@/lib/data/taxonomies";
import { ListingForm } from "@/components/listings/listing-form";
import { createListingAction } from "@/lib/actions/listings";

export const metadata = { title: "Nouvelle annonce" };

export default async function NewListingPage() {
  await requireHost();
  const [cities, neighborhoods, categories] = await Promise.all([
    getCities(),
    getNeighborhoods(),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-hz-navy">Nouvelle annonce</h1>
      <p className="mt-1 text-sm text-hz-ink/60">
        Votre annonce sera soumise à validation avant d&apos;être visible publiquement.
      </p>
      <div className="mt-6 rounded-card border border-hz-navy/10 bg-white p-5">
        <ListingForm action={createListingAction} cities={cities} neighborhoods={neighborhoods} categories={categories} />
      </div>
    </div>
  );
}
