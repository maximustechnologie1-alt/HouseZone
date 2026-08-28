"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getNearbyListingsAction } from "@/lib/actions/nearby";
import { PropertyCard, type PropertyCardData } from "@/components/listings/property-card";

type Status = "idle" | "loading" | "granted" | "denied" | "empty";

export function NearbySection({ favoriteIds }: { favoriteIds: Set<string> }) {
  const [status, setStatus] = useState<Status>("idle");
  const [listings, setListings] = useState<PropertyCardData[]>([]);

  useEffect(() => {
    async function locate() {
      if (!("geolocation" in navigator)) {
        setStatus("denied");
        return;
      }
      setStatus("loading");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const results = await getNearbyListingsAction(position.coords.latitude, position.coords.longitude);
          setListings(results);
          setStatus(results.length > 0 ? "granted" : "empty");
        },
        () => setStatus("denied"),
        { timeout: 8000 }
      );
    }
    locate();
  }, []);

  if (status === "idle" || status === "loading") return null;

  return (
    <section className="hz-container py-8">
      <h2 className="text-xl font-semibold text-hz-navy">Biens près de vous</h2>

      {status === "denied" && (
        <div className="mt-4 flex items-center gap-3 rounded-card border border-dashed border-hz-navy/15 px-5 py-4">
          <MapPin className="h-5 w-5 shrink-0 text-hz-navy/40" />
          <p className="text-sm text-hz-ink/60">
            Activez la localisation pour voir les biens autour de vous, ou{" "}
            <Link href="/recherche" className="font-medium text-hz-blue">
              choisissez une ville
            </Link>
            .
          </p>
        </div>
      )}

      {status === "empty" && (
        <p className="mt-4 text-sm text-hz-ink/60">Aucun bien géolocalisé trouvé près de vous pour le moment.</p>
      )}

      {status === "granted" && (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} isFavorite={favoriteIds.has(listing.id)} />
          ))}
        </div>
      )}
    </section>
  );
}
