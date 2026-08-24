import { createClient } from "@/lib/supabase/server";
import type { PropertyCardData } from "@/components/listings/property-card";
import { publicListingImageUrl } from "@/lib/storage-urls";

export { publicListingImageUrl };

const CARD_SELECT = `
  id, title, price, operation_type, status, bedrooms, furnished, host_id,
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
  furnished: boolean;
  host_id: string;
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
    furnished: row.furnished,
    cityName: row.cities?.name,
    neighborhoodName: row.neighborhoods?.name,
    categoryName: row.property_categories?.name,
    imageUrl: cover ? publicListingImageUrl(cover.storage_path) : null,
    hostVerified: Boolean(hostVerified),
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
