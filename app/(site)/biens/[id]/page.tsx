import { notFound } from "next/navigation";
import { Bath, Bed, Ruler, MapPin, CheckCircle2 } from "lucide-react";
import { getListingDetail, incrementListingViews, publicListingImageUrl } from "@/lib/data/listings";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { VerifiedBadge } from "@/components/ui/badge";
import { Gallery } from "@/components/listings/gallery";
import { VisitRequestDialog } from "@/components/listings/visit-request-dialog";
import { ContactHostButton } from "@/components/listings/contact-host-button";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { ReportButton } from "@/components/reports/report-button";
import { ListingMap } from "@/components/listings/listing-map";
import { formatPrice, initials } from "@/lib/utils";
import { HOST_TYPE_LABELS } from "@/lib/constants";
import { getServerLocale } from "@/lib/i18n/get-locale";
import { DICTIONARIES } from "@/lib/i18n/registry";
import type { HostType } from "@/lib/types/database";

export default async function ListingDetailPage({ params }: PageProps<"/biens/[id]">) {
  const { id } = await params;
  const [listing, locale] = await Promise.all([getListingDetail(id), getServerLocale()]);
  const t = DICTIONARIES[locale];

  if (!listing) notFound();

  const FEATURE_LABELS: Record<string, string> = {
    piscine: t.listing_form.feature_piscine,
    climatisation: t.listing_form.feature_climatisation,
    gardien: t.listing_form.feature_gardien,
    parking: t.listing_form.feature_parking,
    terrasse: t.listing_form.feature_terrasse,
    jardin: t.listing_form.feature_jardin,
    groupe_electrogene: t.listing_form.feature_groupe_electrogene,
    forage: t.listing_form.feature_forage,
    cloture: t.listing_form.feature_cloture,
    internet: t.listing_form.feature_internet,
  };

  const user = await getCurrentUser();
  const isOwner = user?.id === listing.host_id;

  if (listing.status !== "active" && !isOwner && user?.role !== "admin") {
    notFound();
  }

  if (!isOwner) {
    incrementListingViews(id);
  }

  let isFavorite = false;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("favorites")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("listing_id", id)
      .maybeSingle();
    isFavorite = Boolean(data);
  }

  const images = (listing.listing_images ?? [])
    .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
    .map((img: { storage_path: string }) => publicListingImageUrl(img.storage_path));

  const hostProfileRaw = listing.host_profiles;
  const hostProfile = Array.isArray(hostProfileRaw) ? hostProfileRaw[0] : hostProfileRaw;
  const host = listing.host;

  return (
    <div className="hz-container py-6">
      <Gallery images={images} title={listing.title} />

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-hz-navy sm:text-2xl">{listing.title}</h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-hz-ink/60">
                <MapPin className="h-4 w-4" />
                {listing.neighborhoods?.name ? `${listing.neighborhoods.name}, ` : ""}
                {listing.cities?.name}
              </p>
            </div>
            {user && <FavoriteButton listingId={id} initialFavorite={isFavorite} />}
          </div>

          <p className="mt-4 text-2xl font-bold text-hz-navy">
            {formatPrice(listing.price)}
            {listing.operation_type === "location" && (
              <span className="text-sm font-normal text-hz-ink/50"> {t.listing.per_month}</span>
            )}
          </p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-hz-ink/70">
            {listing.property_categories?.name && <span>{listing.property_categories.name}</span>}
            {listing.bedrooms ? (
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4" /> {listing.bedrooms} {t.listing.bedrooms_count}
              </span>
            ) : null}
            {listing.bathrooms ? (
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" /> {listing.bathrooms} {t.listing.bathrooms_count}
              </span>
            ) : null}
            {listing.surface_m2 ? (
              <span className="flex items-center gap-1">
                <Ruler className="h-4 w-4" /> {listing.surface_m2} m²
              </span>
            ) : null}
            {listing.furnished && <span>{t.listing.furnished}</span>}
          </div>

          <div className="mt-6 border-t border-hz-navy/10 pt-6">
            <h2 className="font-semibold text-hz-navy">{t.listing.description}</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-hz-ink/80">{listing.description}</p>
          </div>

          {listing.features && Object.values(listing.features).some(Boolean) && (
            <div className="mt-6 border-t border-hz-navy/10 pt-6">
              <h2 className="font-semibold text-hz-navy">{t.listing.features}</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Object.entries(listing.features)
                  .filter(([, v]) => v)
                  .map(([key]) => (
                    <span key={key} className="flex items-center gap-2 text-sm text-hz-ink/80">
                      <CheckCircle2 className="h-4 w-4 text-hz-blue" /> {FEATURE_LABELS[key] ?? key}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {listing.latitude && listing.longitude && (
            <div className="mt-6 border-t border-hz-navy/10 pt-6">
              <h2 className="font-semibold text-hz-navy">{t.listing.location}</h2>
              <p className="mt-1 text-sm text-hz-ink/60">{listing.address}</p>
              <div className="mt-3">
                <ListingMap lat={listing.latitude} lng={listing.longitude} label={listing.title} />
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-card border border-hz-navy/10 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-hz-navy text-white">
                {host ? initials(host.first_name, host.last_name) : "?"}
              </span>
              <div>
                <p className="font-medium text-hz-navy">
                  {hostProfile?.company_name || (host ? `${host.first_name} ${host.last_name}` : t.listing.host_default)}
                </p>
                <p className="text-xs text-hz-ink/60">
                  {hostProfile?.host_type ? HOST_TYPE_LABELS[hostProfile.host_type as HostType] : ""}
                </p>
              </div>
            </div>
            {hostProfile?.badge_verified && (
              <div className="mt-3">
                <VerifiedBadge />
              </div>
            )}

            {isOwner ? (
              <p className="mt-4 rounded-xl bg-hz-sky px-3 py-2 text-xs text-hz-ink/70">
                {t.listing.your_listing_notice}{" "}
                <a href={`/espace-hote/annonces/${id}/modifier`} className="font-medium text-hz-blue">
                  {t.listing.edit}
                </a>
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                <VisitRequestDialog listingId={id} />
                <ContactHostButton listingId={id} />
              </div>
            )}
          </div>

          {!isOwner && (
            <div className="flex justify-end px-1">
              <ReportButton targetType="listing" targetId={id} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
