"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import type { City, Neighborhood, PropertyCategory } from "@/lib/types/database";

interface AdvancedSearchSheetProps {
  open: boolean;
  onClose: () => void;
  cities: City[];
  neighborhoods: Neighborhood[];
  categories: PropertyCategory[];
}

const TRANSACTIONS = [
  { value: "", label: "Indifférent" },
  { value: "location", label: "Location" },
  { value: "vente", label: "Vente" },
] as const;

const FURNISHED_OPTIONS = [
  { value: "", label: "Indifférent" },
  { value: "1", label: "Meublé" },
  { value: "0", label: "Non meublé" },
] as const;

export function AdvancedSearchSheet({ open, onClose, cities, neighborhoods, categories }: AdvancedSearchSheetProps) {
  const router = useRouter();

  const [cityId, setCityId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [operation, setOperation] = useState<string>("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [furnished, setFurnished] = useState<string>("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const filteredNeighborhoods = useMemo(
    () => neighborhoods.filter((n) => n.city_id === cityId),
    [neighborhoods, cityId]
  );

  if (!open) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-hz-navy/40 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white sm:max-w-lg sm:rounded-card">
        <div className="flex items-center justify-between border-b border-hz-navy/10 px-5 py-4">
          <h2 className="text-lg font-semibold text-hz-navy">Recherche avancée</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-9 w-9 items-center justify-center rounded-full text-hz-navy hover:bg-hz-sky"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-hz-navy">
              <MapPin className="h-4 w-4" /> Localisation
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Select value={cityId} onChange={(e) => { setCityId(e.target.value); setNeighborhoodId(""); }}>
                <option value="">Toutes les villes</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Select value={neighborhoodId} onChange={(e) => setNeighborhoodId(e.target.value)} disabled={!cityId}>
                <option value="">Tous les quartiers</option>
                {filteredNeighborhoods.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-hz-navy">Type de bien</p>
            <div className="flex flex-wrap gap-2">
              <PillOption active={categoryId === ""} onClick={() => setCategoryId("")}>
                Tous
              </PillOption>
              {categories.map((c) => (
                <PillOption key={c.id} active={categoryId === c.id} onClick={() => setCategoryId(c.id)}>
                  {c.name}
                </PillOption>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-hz-navy">Transaction</p>
            <div className="flex flex-wrap gap-2">
              {TRANSACTIONS.map((t) => (
                <PillOption key={t.value} active={operation === t.value} onClick={() => setOperation(t.value)}>
                  {t.label}
                </PillOption>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-hz-navy">Prix (FCFA)</p>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Minimum" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <Input type="number" placeholder="Maximum" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-hz-navy">Chambres</p>
            <div className="flex flex-wrap gap-2">
              <PillOption active={bedrooms === ""} onClick={() => setBedrooms("")}>
                Indifférent
              </PillOption>
              {[1, 2, 3, 4, 5].map((n) => (
                <PillOption key={n} active={bedrooms === String(n)} onClick={() => setBedrooms(String(n))}>
                  {n}+
                </PillOption>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-hz-navy">Meublé</p>
            <div className="flex flex-wrap gap-2">
              {FURNISHED_OPTIONS.map((f) => (
                <PillOption key={f.value} active={furnished === f.value} onClick={() => setFurnished(f.value)}>
                  {f.label}
                </PillOption>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-hz-navy">Autres filtres</p>
            <div className="flex flex-wrap gap-2">
              <PillOption active={verifiedOnly} onClick={() => setVerifiedOnly((v) => !v)}>
                Hôte vérifié
              </PillOption>
              <PillOption active={featuredOnly} onClick={() => setFeaturedOnly((v) => !v)}>
                À la une
              </PillOption>
            </div>
          </div>
        </div>

        <div className="border-t border-hz-navy/10 p-4">
          <Button onClick={submit} size="lg" className="w-full">
            <Search className="h-4 w-4" /> Rechercher
          </Button>
        </div>
      </div>
    </div>
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
