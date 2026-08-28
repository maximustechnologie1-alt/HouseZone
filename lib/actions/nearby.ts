"use server";

import { getNearbyListings } from "@/lib/data/listings";

// Wraps lib/data/listings.ts's getNearbyListings as a Server Action so the
// client-side "Biens près de vous" widget (which reads navigator.geolocation
// in the browser) can fetch results without a dedicated route handler.
export async function getNearbyListingsAction(lat: number, lng: number) {
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    Number.isNaN(lat) ||
    Number.isNaN(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return [];
  }
  return getNearbyListings(lat, lng, 6);
}
