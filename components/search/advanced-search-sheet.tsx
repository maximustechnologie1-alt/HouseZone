"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/hooks/use-mounted";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { useI18n } from "@/lib/i18n/context";
import type { City, Neighborhood, PropertyCategory } from "@/lib/types/database";

interface AdvancedSearchSheetProps {
  open: boolean;
  onClose: () => void;
  cities: City[];
  neighborhoods: Neighborhood[];
  categories: PropertyCategory[];
}

// Wrapper léger : ne monte le contenu (et ses states) que pendant que le
// sheet est ouvert. Ainsi, à chaque ouverture, le contenu est remonté à
// neuf et ses states s'initialisent depuis les query params actuels de
// l'URL (ex: rouvert depuis /recherche avec des filtres déjà actifs).
export function AdvancedSearchSheet({ open, onClose, cities, neighborhoods, categories }: AdvancedSearchSheetProps) {
  const mounted = useMounted();
  if (!open || !mounted) return null;
  return (
    <AdvancedSearchSheetContent onClose={onClose} cities={cities} neighborhoods={neighborhoods} categories={categories} />
  );
}

function AdvancedSearchSheetContent({
  onClose,
  cities,
  neighborhoods,
  categories,
}: Omit<AdvancedSearchSheetProps, "open">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const TRANSACTIONS = [
    { value: "", label: t("search.indifferent") },
    { value: "location", label: t("search.location") },
    { value: "vente", label: t("search.sale") },
  ] as const;

  const FURNISHED_OPTIONS = [
    { value: "", label: t("search.indifferent") },
    { value: "1", label: t("search.furnished_yes") },
    { value: "0", label: t("search.furnished_no") },
  ] as const;

  const [cityId, setCityId] = useState(() => searchParams.get("ville") ?? "");
  const [neighborhoodId, setNeighborhoodId] = useState(() => searchParams.get("quartier") ?? "");
  const [categoryId, setCategoryId] = useState(() => searchParams.get("categorie") ?? "");
  const [operation, setOperation] = useState<string>(() => searchParams.get("operation") ?? "");
  const [minPrice, setMinPrice] = useState(() => searchParams.get("prixMin") ?? "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("prixMax") ?? "");
  const [bedrooms, setBedrooms] = useState(() => searchParams.get("chambres") ?? "");
  const [furnished, setFurnished] = useState<string>(() => searchParams.get("meuble") ?? "");
  const [verifiedOnly, setVerifiedOnly] = useState(() => searchParams.get("verifie") === "1");
  const [featuredOnly, setFeaturedOnly] = useState(() => searchParams.get("une") === "1");

  const filteredNeighborhoods = useMemo(
    () => neighborhoods.filter((n) => n.city_id === cityId),
    [neighborhoods, cityId]
  );

  function submit() {
    const params = new URLSearchParams();
    if (cityId) params.set("ville", cityId);
    if (neighborhoodId) params.set("quartier", neighborhoodId);
    if (categoryId) params.set("categorie", categoryId);
    if (operation) params.set("operation", operation);
    if (minPrice) params.set("prixMin", minPrice);
    if (maxPrice) params.set("prixMax", maxPrice);
    if (bedrooms) params.set("chambres", bedrooms);
    if (furnished) params.set("meuble", furnished);
    if (verifiedOnly) params.set("verifie", "1");
    if (featuredOnly) params.set("une", "1");
    router.push(`/recherche?${params.toString()}`);
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-hz-navy/40 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white sm:max-w-lg sm:rounded-card">
        <div className="flex items-center justify-between border-b border-hz-navy/10 px-5 py-4">
          <h2 className="text-lg font-semibold text-hz-navy">{t("search.advanced_title")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("search.close")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-hz-navy hover:bg-hz-sky"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-hz-navy">
              <MapPin className="h-4 w-4" /> {t("search.location_section")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Select value={cityId} onChange={(e) => { setCityId(e.target.value); setNeighborhoodId(""); }}>
                <option value="">{t("search.all_cities")}</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Select value={neighborhoodId} onChange={(e) => setNeighborhoodId(e.target.value)} disabled={!cityId}>
                <option value="">{t("search.all_neighborhoods")}</option>
                {filteredNeighborhoods.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-hz-navy">{t("search.property_type")}</p>
            <div className="flex flex-wrap gap-2">
              <PillOption active={categoryId === ""} onClick={() => setCategoryId("")}>
                {t("search.all")}
              </PillOption>
              {categories.map((c) => (
                <PillOption key={c.id} active={categoryId === c.id} onClick={() => setCategoryId(c.id)}>
                  {c.name}
                </PillOption>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-hz-navy">{t("search.transaction")}</p>
            <div className="flex flex-wrap gap-2">
              {TRANSACTIONS.map((option) => (
                <PillOption key={option.value} active={operation === option.value} onClick={() => setOperation(option.value)}>
                  {option.label}
                </PillOption>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-hz-navy">{t("search.price_fcfa")}</p>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder={t("search.price_min")} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <Input type="number" placeholder={t("search.price_max")} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-hz-navy">{t("search.bedrooms")}</p>
            <div className="flex flex-wrap gap-2">
              <PillOption active={bedrooms === ""} onClick={() => setBedrooms("")}>
                {t("search.indifferent")}
              </PillOption>
              {[1, 2, 3, 4, 5].map((n) => (
                <PillOption key={n} active={bedrooms === String(n)} onClick={() => setBedrooms(String(n))}>
                  {n}+
                </PillOption>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-hz-navy">{t("search.furnished_yes")}</p>
            <div className="flex flex-wrap gap-2">
              {FURNISHED_OPTIONS.map((f) => (
                <PillOption key={f.value} active={furnished === f.value} onClick={() => setFurnished(f.value)}>
                  {f.label}
                </PillOption>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-hz-navy">{t("search.other_filters")}</p>
            <div className="flex flex-wrap gap-2">
              <PillOption active={verifiedOnly} onClick={() => setVerifiedOnly((v) => !v)}>
                {t("search.verified_host")}
              </PillOption>
              <PillOption active={featuredOnly} onClick={() => setFeaturedOnly((v) => !v)}>
                {t("search.featured")}
              </PillOption>
            </div>
          </div>
        </div>

        <div className="border-t border-hz-navy/10 p-4">
          <Button onClick={submit} size="lg" className="w-full">
            <Search className="h-4 w-4" /> {t("search.search_cta")}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function PillOption({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active ? "border-hz-blue bg-hz-blue text-white" : "border-hz-navy/15 text-hz-ink/70 hover:bg-hz-sky"
      )}
    >
      {children}
    </button>
  );
}
