import { Heart } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getFavoriteListings } from "@/lib/data/listings";
import { PropertyCard } from "@/components/listings/property-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Favoris" };

export default async function FavoritesPage() {
  const user = await requireUser("/favoris");
  const listings = await getFavoriteListings(user.id);

  return (
    <div className="hz-container py-8">
      <h1 className="text-xl font-semibold text-hz-navy">Mes favoris</h1>
      <p className="mt-1 text-sm text-hz-ink/60">{listings.length} bien(s) enregistré(s)</p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Heart}
              title="Aucun favori pour l'instant"
              description="Ajoutez des biens à vos favoris pour les retrouver ici facilement."
            />
          </div>
        ) : (
          listings.map((listing) => <PropertyCard key={listing.id} listing={listing} isFavorite />)
        )}
      </div>
    </div>
  );
}
