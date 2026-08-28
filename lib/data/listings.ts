import { createClient } from "@/lib/supabase/server";
import type { PropertyCardData } from "@/components/listings/property-card";
import { publicListingImageUrl } from "@/lib/storage-urls";

export { publicListingImageUrl };

const CARD_SELECT = `
  id, title, price, operation_type, status, bedrooms, bathrooms, furnished, host_id, boosted_until,
  cities ( name ),
  neighborhoods ( name ),
  property_categories ( name ),
  listing_images ( storage_path, position ),
  host_profiles:host_profiles!host_profiles_user_id_fkey ( badge_verified )
`;

// Supabase-js infers deeply nested selects poorly without generated types;
// this row shape matches CARD_SELECT above.
interface ListingCardRow {
  id: string;
  title: string;
  price: number;
  operation_type: PropertyCardData["operation_type"];
  status: PropertyCardData["status"];
  bedrooms: number | null;
  bathrooms: number | null;
  furnished: boolean;
  host_id: string;
  boosted_until: string | null;
  cities: { name: string } | null;
  neighborhoods: { name: string } | null;
  property_categories: { name: string } | null;
  listing_images: { storage_path: string; position: number }[];
  host_profiles: { badge_verified: boolean }[] | { badge_verified: boolean } | null;
}

function mapRow(row: ListingCardRow): PropertyCardData {
  const cover = [...(row.listing_images ?? [])].sort((a, b) => a.position - b.position)[0];
  const hostVerified = Array.isArray(row.host_profiles)
    ? row.host_profiles[0]?.badge_verified
    : row.host_profiles?.badge_verified;

  return {
    id: row.id,
    title: row.title,
    price: row.price,
    operation_type: row.operation_type,
    status: row.status,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    furnished: row.furnished,
    cityName: row.cities?.name,
    neighborhoodName: row.neighborhoods?.name,
    categoryName: row.property_categories?.name,
    imageUrl: cover ? publicListingImageUrl(cover.storage_path) : null,
    hostVerified: Boolean(hostVerified),
    featured: Boolean(row.boosted_until && new Date(row.boosted_until) > new Date()),
  };
}

export interface SearchFilters {
  q?: string;
  cityId?: string;
  neighborhoodId?: string;
  categoryId?: string;
  operationType?: "location" | "vente" | "reservation";
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  furnished?: boolean;
  verifiedHostOnly?: boolean;
  featuredOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export async function searchListings(filters: SearchFilters) {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("listings")
    .select(CARD_SELECT, { count: "exact" })
    .eq("status", "active")
    .order("boosted_until", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.q) query = query.ilike("title", `%${filters.q}%`);
  if (filters.cityId) query = query.eq("city_id", filters.cityId);
  if (filters.neighborhoodId) query = query.eq("neighborhood_id", filters.neighborhoodId);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.operationType) query = query.eq("operation_type", filters.operationType);
  if (filters.minPrice) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
  if (filters.bedrooms) query = query.gte("bedrooms", filters.bedrooms);
  if (filters.furnished !== undefined) query = query.eq("furnished", filters.furnished);
  if (filters.verifiedHostOnly) query = query.eq("host_profiles.badge_verified", true);
  if (filters.featuredOnly) query = query.not("boosted_until", "is", null);

  const { data, count, error } = await query;
  if (error) {
    console.error("searchListings error", error.message);
    return { listings: [] as PropertyCardData[], total: 0, page, pageSize };
  }

  return {
    listings: ((data ?? []) as unknown as ListingCardRow[]).map(mapRow),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getFeaturedListings(limit = 8) {
  const { listings } = await searchListings({ pageSize: limit });
  return listings;
}

export async function getListingsByCategory(family: "maison" | "appartement" | "terrain", limit = 8) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(CARD_SELECT)
    .eq("status", "active")
    .eq("property_categories.family", family)
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as unknown as ListingCardRow[]).map(mapRow);
}

// Section d'accueil "Top résidences & appartements à la une" — biens boostés
// en priorité, complétés par les plus récents pour ne jamais afficher une
// section vide tant qu'aucun boost n'a été acheté.
export async function getTopFeaturedListings(limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(CARD_SELECT)
    .eq("status", "active")
    .eq("property_categories.family", "appartement")
    .order("boosted_until", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as unknown as ListingCardRow[]).map(mapRow);
}

// Sections verticales de l'accueil filtrées par catégorie précise plutôt que
// par famille — Résidences/Appartements/Meublés/Villas se chevauchent dans
// la taxonomie (ex: "résidence meublée" appartient à la fois à Résidences et
// Meublés), donc chaque section précise ses propres slugs.
export async function getListingsByCategorySlugs(slugs: string[], limit = 6) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(CARD_SELECT)
    .eq("status", "active")
    .in("property_categories.slug", slugs)
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as unknown as ListingCardRow[]).map(mapRow);
}

export interface NearbyListing extends PropertyCardData {
  latitude: number;
  longitude: number;
}

// "Biens près de vous" — filtrage grossier par boîte englobante (~50km)
// autour du point donné, puis tri précis par distance en mémoire. Suffisant
// pour un catalogue de taille modeste sans dépendance géospatiale (PostGIS).
export async function getNearbyListings(lat: number, lng: number, limit = 6): Promise<NearbyListing[]> {
  const supabase = await createClient();
  const latDelta = 0.45; // ≈ 50 km
  const lngDelta = 0.6;

  const { data } = await supabase
    .from("listings")
    .select(CARD_SELECT.replace("id, title,", "id, title, latitude, longitude,"))
    .eq("status", "active")
    .gte("latitude", lat - latDelta)
    .lte("latitude", lat + latDelta)
    .gte("longitude", lng - lngDelta)
    .lte("longitude", lng + lngDelta)
    .limit(50);

  type NearbyRow = ListingCardRow & { latitude: number | null; longitude: number | null };
  const rows = ((data ?? []) as unknown as NearbyRow[]).filter(
    (r): r is NearbyRow & { latitude: number; longitude: number } => r.latitude != null && r.longitude != null
  );

  function distance(a: { latitude: number; longitude: number }) {
    const dLat = a.latitude - lat;
    const dLng = a.longitude - lng;
    return dLat * dLat + dLng * dLng; // proxy suffisant pour un tri local
  }

  return rows
    .sort((a, b) => distance(a) - distance(b))
    .slice(0, limit)
    .map((row) => ({ ...mapRow(row), latitude: row.latitude, longitude: row.longitude }));
}

export async function getUserFavoriteIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", userId);
  return new Set((data ?? []).map((f) => f.listing_id));
}

export async function getFavoriteListings(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select(`listings ( ${CARD_SELECT} )`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as { listings: ListingCardRow | ListingCardRow[] }[];
  return rows
    .map((row) => (Array.isArray(row.listings) ? row.listings[0] : row.listings))
    .filter(Boolean)
    .map((row) => mapRow(row as ListingCardRow));
}

export async function getListingDetail(id: string) {
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select(
      `*, cities ( name ), neighborhoods ( name ), property_categories ( name ),
       listing_images ( id, storage_path, position ),
       host:profiles!listings_host_id_fkey ( id, first_name, last_name, avatar_url, created_at ),
       host_profiles:host_profiles!host_profiles_user_id_fkey ( host_type, company_name, badge_verified, verification_status )`
    )
    .eq("id", id)
    .maybeSingle();

  return listing;
}

export async function incrementListingViews(id: string) {
  const supabase = await createClient();
  await supabase.rpc("increment_listing_views", { listing_id: id }).then(
    () => {},
    () => {
      // Fallback if the RPC isn't installed — best-effort, non-blocking.
    }
  );
}
