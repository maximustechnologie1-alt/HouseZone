import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, AlertTriangle } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { publicListingImageUrl } from "@/lib/data/listings";
import { Card, Badge } from "@/components/ui/badge";
import { ListingModerationActions } from "@/components/admin/listing-moderation-actions";
import { LISTING_STATUS_COLORS, LISTING_STATUS_LABELS, HOST_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Listing, ListingImage } from "@/lib/types/database";

export const metadata = { title: "Détail annonce" };

const FEATURE_LABELS: Record<string, string> = {
  piscine: "Piscine",
  climatisation: "Climatisation",
  gardien: "Gardien",
  parking: "Parking",
  terrasse: "Terrasse",
  jardin: "Jardin",
  groupe_electrogene: "Groupe électrogène",
  forage: "Forage",
  cloture: "Clôturé",
  internet: "Internet",
};

export default async function AdminListingDetailPage({ params }: PageProps<"/admin/annonces/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select(
      `*, cities ( name ), neighborhoods ( name ), property_categories ( name ),
       listing_images ( id, storage_path, position, is_flagged, ocr_flagged_text ),
       host:profiles!listings_host_id_fkey ( id, first_name, last_name, email, phone ),
       host_profiles:host_profiles!host_profiles_user_id_fkey ( id, host_type, badge_verified, verification_status )`
    )
    .eq("id", id)
    .maybeSingle();

  if (!listing) notFound();

  const l = listing as unknown as Listing & {
    cities: { name: string } | null;
    neighborhoods: { name: string } | null;
    property_categories: { name: string } | null;
    listing_images: ListingImage[];
    host: { id: string; first_name: string; last_name: string; email: string | null; phone: string | null } | null;
    host_profiles: { id: string; host_type: string; badge_verified: boolean; verification_status: string } | { id: string; host_type: string; badge_verified: boolean; verification_status: string }[] | null;
  };

  const hostProfile = Array.isArray(l.host_profiles) ? l.host_profiles[0] : l.host_profiles;
  const images = [...(l.listing_images ?? [])].sort((a, b) => a.position - b.position);
  const activeFeatures = Object.entries(l.features ?? {}).filter(([, v]) => v);

  return (
    <div>
      <Link href="/admin/annonces" className="text-sm font-medium text-hz-blue hover:underline">
        ← Retour aux annonces
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-hz-navy">{l.title}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-hz-ink/60">
            <MapPin className="h-3.5 w-3.5" />
            {l.neighborhoods?.name ? `${l.neighborhoods.name}, ` : ""}
            {l.cities?.name} · {l.property_categories?.name}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Badge className={LISTING_STATUS_COLORS[l.status]}>{LISTING_STATUS_LABELS[l.status]}</Badge>
            {l.moderation_flag && (
              <Badge className="bg-amber-100 text-amber-700">
                <AlertTriangle className="mr-1 inline h-3 w-3" /> Signalée par la modération OCR
              </Badge>
            )}
          </div>
        </div>
        <ListingModerationActions listingId={l.id} adminId={admin.id} />
      </div>

      {l.rejection_reason && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Motif précédent : {l.rejection_reason}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <h2 className="font-semibold text-hz-navy">Images</h2>
            {images.length === 0 ? (
              <p className="mt-2 text-sm text-hz-ink/50">Aucune image.</p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((img) => (
                  <div key={img.id} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={publicListingImageUrl(img.storage_path)}
                      alt=""
                      className={`aspect-[4/3] w-full rounded-lg object-cover ${
                        img.is_flagged ? "ring-2 ring-red-500" : ""
                      }`}
                    />
                    {img.is_flagged && (
                      <span className="absolute bottom-1 left-1 right-1 truncate rounded bg-red-600/90 px-1.5 py-0.5 text-[10px] text-white">
                        {img.ocr_flagged_text || "Contenu signalé"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-hz-navy">Description</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-hz-ink/70">{l.description}</p>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-hz-navy">Caractéristiques</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-hz-ink/50">Prix</dt>
                <dd className="text-hz-ink">{formatPrice(l.price)}</dd>
              </div>
              <div>
                <dt className="text-hz-ink/50">Chambres</dt>
                <dd className="text-hz-ink">{l.bedrooms ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-hz-ink/50">Salles de bain</dt>
                <dd className="text-hz-ink">{l.bathrooms ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-hz-ink/50">Surface</dt>
                <dd className="text-hz-ink">{l.surface_m2 ? `${l.surface_m2} m²` : "—"}</dd>
              </div>
              <div>
                <dt className="text-hz-ink/50">Meublé</dt>
                <dd className="text-hz-ink">{l.furnished ? "Oui" : "Non"}</dd>
              </div>
              <div>
                <dt className="text-hz-ink/50">Adresse</dt>
                <dd className="text-hz-ink">{l.address ?? "—"}</dd>
              </div>
            </dl>
            {activeFeatures.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeFeatures.map(([k]) => (
                  <Badge key={k} className="bg-hz-sky text-hz-navy">
                    {FEATURE_LABELS[k] ?? k}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="p-5 lg:col-span-1">
          <h2 className="font-semibold text-hz-navy">Hôte</h2>
          {l.host ? (
            <div className="mt-3 space-y-1 text-sm">
              <Link href={`/admin/utilisateurs/${l.host.id}`} className="font-medium text-hz-navy hover:underline">
                {l.host.first_name} {l.host.last_name}
              </Link>
              <p className="text-hz-ink/60">{l.host.email ?? "—"}</p>
              <p className="text-hz-ink/60">{l.host.phone ?? "—"}</p>
              {hostProfile && (
                <>
                  <p className="mt-2 text-hz-ink/60">
                    {HOST_TYPE_LABELS[hostProfile.host_type as keyof typeof HOST_TYPE_LABELS] ?? hostProfile.host_type}
                  </p>
                  <Link href={`/admin/hotes/${hostProfile.id}`} className="text-sm font-medium text-hz-blue hover:underline">
                    Voir le dossier Hôte →
                  </Link>
                </>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-hz-ink/50">Hôte introuvable.</p>
          )}

          <div className="mt-4 border-t border-hz-navy/10 pt-4 text-sm">
            <p className="text-hz-ink/50">Créée le</p>
            <p className="text-hz-ink">{formatDate(l.created_at)}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
