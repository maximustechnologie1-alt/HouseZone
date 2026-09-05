"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Select, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import type { City, Neighborhood, PropertyCategory } from "@/lib/types/database";

export function SearchFilters({
  cities,
  neighborhoods,
  categories,
}: {
  cities: City[];
  neighborhoods: Neighborhood[];
  categories: PropertyCategory[];
}) {
  const router = useRouter();
  const { t } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function toggle(key: string) {
    update(key, searchParams.get(key) === "1" ? "" : "1");
  }

  const selectedCity = searchParams.get("ville") ?? "";
  const filteredNeighborhoods = useMemo(
    () => neighborhoods.filter((n) => n.city_id === selectedCity),
    [neighborhoods, selectedCity]
  );

  const activeCount = [
    "ville",
    "quartier",
    "categorie",
    "operation",
    "prixMin",
    "prixMax",
    "chambres",
    "meuble",
    "verifie",
    "une",
  ].filter((k) => searchParams.get(k)).length;

  return (
    <div className="rounded-card border border-hz-navy/10 bg-white p-4">
      <div className="flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-hz-navy"
        >
          <SlidersHorizontal className="h-4 w-4" /> {t("search.filters_button")} {activeCount > 0 && `(${activeCount})`}
        </button>
      </div>
      <div className={`${open ? "grid" : "hidden"} mt-4 grid-cols-2 gap-3 md:mt-0 md:grid md:grid-cols-6`}>
        <Select
          defaultValue={searchParams.get("operation") ?? ""}
          onChange={(e) => update("operation", e.target.value)}
        >
          <option value="">{t("search.location_or_sale")}</option>
          <option value="location">{t("search.location")}</option>
          <option value="vente">{t("search.sale")}</option>
          <option value="reservation">{t("search.reservation_furnished")}</option>
        </Select>
        <Select
          defaultValue={selectedCity}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams.toString());
            if (e.target.value) params.set("ville", e.target.value);
            else params.delete("ville");
            params.delete("quartier");
            params.delete("page");
            startTransition(() => router.push(`${pathname}?${params.toString()}`));
          }}
        >
          <option value="">{t("search.all_cities")}</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          key={selectedCity}
          defaultValue={searchParams.get("quartier") ?? ""}
          onChange={(e) => update("quartier", e.target.value)}
          disabled={!selectedCity}
        >
          <option value="">{t("search.all_neighborhoods")}</option>
          {filteredNeighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </Select>
        <Select
          defaultValue={searchParams.get("categorie") ?? ""}
          onChange={(e) => update("categorie", e.target.value)}
        >
          <option value="">{t("search.all_types")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input
          type="number"
          placeholder={t("search.budget_min")}
          defaultValue={searchParams.get("prixMin") ?? ""}
          onBlur={(e) => update("prixMin", e.target.value)}
        />
        <Input
          type="number"
          placeholder={t("search.budget_max")}
          defaultValue={searchParams.get("prixMax") ?? ""}
          onBlur={(e) => update("prixMax", e.target.value)}
        />
        <Select
          defaultValue={searchParams.get("chambres") ?? ""}
          onChange={(e) => update("chambres", e.target.value)}
        >
          <option value="">{t("search.bedrooms")}</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </Select>
        <Select
          defaultValue={searchParams.get("meuble") ?? ""}
          onChange={(e) => update("meuble", e.target.value)}
        >
          <option value="">{t("search.furnished_yes")} / {t("search.furnished_no")}</option>
          <option value="1">{t("search.furnished_yes")}</option>
          <option value="0">{t("search.furnished_no")}</option>
        </Select>
        <label className="flex items-center gap-2 rounded-xl border border-hz-navy/15 bg-white px-4 py-2.5 text-sm text-hz-ink">
          <input
            type="checkbox"
            checked={searchParams.get("verifie") === "1"}
            onChange={() => toggle("verifie")}
            className="h-4 w-4 rounded border-hz-navy/30 text-hz-blue focus:ring-hz-blue/30"
          />
          {t("search.verified_host")}
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-hz-navy/15 bg-white px-4 py-2.5 text-sm text-hz-ink">
          <input
            type="checkbox"
            checked={searchParams.get("une") === "1"}
            onChange={() => toggle("une")}
            className="h-4 w-4 rounded border-hz-navy/30 text-hz-blue focus:ring-hz-blue/30"
          />
          {t("search.featured")}
        </label>
      </div>
      {activeCount > 0 && (
        <div className="mt-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
            <X className="h-3.5 w-3.5" /> {t("search.reset_filters")}
          </Button>
        </div>
      )}
    </div>
  );
}
