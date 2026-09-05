import { createClient } from "@/lib/supabase/server";
import type { PropertyCardData } from "@/components/listings/property-card";
import { publicListingImageUrl } from "@/lib/storage-urls";

export { publicListingImageUrl };

const CARD_SELECT = `
  id, title, price, operation_type, status, bedrooms, bathrooms, furnished, host_id, boosted_until,
  cities ( name ),
  neighborhoods ( name ),
  property_categories ( name ),
  listing_images ( storage_path, position )
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
}

// `listings` and `host_profiles` both reference `profiles` independently
// (host_id / user_id) rather than one another directly, so PostgREST can't
// embed host_profiles on a listings query — there's no FK between the two
// tables for it to resolve. Verification status is fetched separately here
// and merged in by host_id instead.
async function getHostVerificationMap(
  supabase: Awaited<ReturnType<typeof createClient>>,
  hostIds: string[]
): Promise<Map<string, boolean>> {
  if (hostIds.length === 0) return new Map();
  const { data } = await supabase.from("host_profiles").select("user_id, badge_verified").in("user_id", hostIds);
  return new Map((data ?? []).map((h) => [h.user_id as string, Boolean(h.badge_verified)]));
}

function mapRow(row: ListingCardRow, hostVerified: boolean): PropertyCardData {
  const cover = [...(row.listing_images ?? [])].sort((a, b) => a.position - b.position)[0];

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
    hostVerified,
    featured: Boolean(row.boosted_until && new Date(row.boosted_until) > new Date()),
  };
}

export interface SearchFilters {
  q?: string;
  cityId?: string;
  /** Quartier en saisie libre : recherche sur le nom du quartier et l'adresse. */
  neighborhood?: string;
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

  // Quartier libre : on fait correspondre le texte saisi soit au nom d'un
  // quartier référencé (neighborhoods.name), soit à l'adresse libre de
  // l'annonce (address). On résout d'abord les ids de quartiers dont le nom
  // correspond, puis on combine les deux critères en OR sur `listings`.
  const neighborhoodText = filters.neighborhood?.trim();
  if (neighborhoodText) {
    const pattern = `%${neighborhoodText.replace(/[%,()]/g, " ")}%`;
    let nQuery = supabase.from("neighborhoods").select("id").ilike("name", pattern);
    if (filters.cityId) nQuery = nQuery.eq("city_id", filters.cityId);
    const { data: matchingNeighborhoods } = await nQuery;
    const ids = (matchingNeighborhoods ?? []).map((n) => n.id as string);
    query = query.or(
      ids.length > 0
        ? `address.ilike.${pattern},neighborhood_id.in.(${ids.join(",")})`
        : `address.ilike.${pattern}`
    );
  }
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.operationType) query = query.eq("operation_type", filters.operationType);
  if (filters.minPrice) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
  if (filters.bedrooms) query = query.gte("bedrooms", filters.bedrooms);
  if (filters.furnished !== undefined) query = query.eq("furnished", filters.furnished);
  if (filters.featuredOnly) query = query.not("boosted_until", "is", null);

  if (filters.verifiedHostOnly) {
    const { data: verified } = await supabase.from("host_profiles").select("user_id").eq("badge_verified", true);
    const verifiedHostIds = (verified ?? []).map((h) => h.user_id as string);
    if (verifiedHostIds.length === 0) {
      return { listings: [] as PropertyCardData[], total: 0, page, pageSize };
    }
    query = query.in("host_id", verifiedHostIds);
  }

  const { data, count, error } = await query;
  if (error) {
    console.error("searchListings error", error.message);
    return { listings: [] as PropertyCardData[], total: 0, page, pageSize };
  }

  const rows = (data ?? []) as unknown as ListingCardRow[];
  const verifiedMap = await getHostVerificationMap(supabase, [...new Set(rows.map((r) => r.host_id))]);

  return {
    listings: rows.map((row) => mapRow(row, verifiedMap.get(row.host_id) ?? false)),
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

  const rows = (data ?? []) as unknown as ListingCardRow[];
  const verifiedMap = await getHostVerificationMap(supabase, [...new Set(rows.map((r) => r.host_id))]);
  return rows.map((row) => mapRow(row, verifiedMap.get(row.host_id) ?? false));
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

  const rows = (data ?? []) as unknown as ListingCardRow[];
  const verifiedMap = await getHostVerificationMap(supabase, [...new Set(rows.map((r) => r.host_id))]);
  return rows.map((row) => mapRow(row, verifiedMap.get(row.host_id) ?? false));
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

  const rows = (data ?? []) as unknown as ListingCardRow[];
  const verifiedMap = await getHostVerificationMap(supabase, [...new Set(rows.map((r) => r.host_id))]);
  return rows.map((row) => mapRow(row, verifiedMap.get(row.host_id) ?? false));
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

  const nearest = rows.sort((a, b) => distance(a) - distance(b)).slice(0, limit);
  const verifiedMap = await getHostVerificationMap(supabase, [...new Set(nearest.map((r) => r.host_id))]);

  return nearest.map((row) => ({
    ...mapRow(row, verifiedMap.get(row.host_id) ?? false),
    latitude: row.latitude,
    longitude: row.longitude,
  }));
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
  const listingRows = rows
    .map((row) => (Array.isArray(row.listings) ? row.listings[0] : row.listings))
    .filter(Boolean) as ListingCardRow[];
  const verifiedMap = await getHostVerificationMap(supabase, [...new Set(listingRows.map((r) => r.host_id))]);
  return listingRows.map((row) => mapRow(row, verifiedMap.get(row.host_id) ?? false));
}

export async function getListingDetail(id: string) {
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select(
      `*, cities ( name ), neighborhoods ( name ), property_categories ( name ),
       listing_images ( id, storage_path, position ),
       host:profiles!listings_host_id_fkey ( id, first_name, last_name, avatar_url, created_at )`
    )
    .eq("id", id)
    .maybeSingle();

  if (!listing) return listing;

  // See getHostVerificationMap: no direct FK between listings and
  // host_profiles for PostgREST to embed, so it's fetched separately.
  const { data: hostProfile } = await supabase
    .from("host_profiles")
    .select("host_type, company_name, badge_verified, verification_status")
    .eq("user_id", listing.host_id)
    .maybeSingle();

  return { ...listing, host_profiles: hostProfile };
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
