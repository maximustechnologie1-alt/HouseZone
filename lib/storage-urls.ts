// Pure helpers with no server-only dependencies (no `next/headers`, no
// Supabase client) so they can be safely imported from Client Components —
// see lib/data/listings.ts, which re-exports `publicListingImageUrl` for
// server-side callers, and components/listings/listing-image-manager.tsx,
// which is a Client Component that needs it directly.
export function publicListingImageUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/listing-images/${path}`;
}
