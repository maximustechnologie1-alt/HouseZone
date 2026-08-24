"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Select, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { City, PropertyCategory } from "@/lib/types/database";

export function SearchFilters({ cities, categories }: { cities: City[]; categories: PropertyCategory[] }) {
  const router = useRouter();
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

  const activeCount = ["ville", "categorie", "operation", "prixMin", "prixMax", "chambres"].filter((k) =>
    searchParams.get(k)
  ).length;

  return (
    <div className="rounded-card border border-hz-navy/10 bg-white p-4">
      <div className="flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-hz-navy"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filtres {activeCount > 0 && `(${activeCount})`}
        </button>
      </div>
      <div className={`${open ? "grid" : "hidden"} mt-4 grid-cols-2 gap-3 md:mt-0 md:grid md:grid-cols-6`}>
        <Select
          defaultValue={searchParams.get("operation") ?? ""}
          onChange={(e) => update("operation", e.target.value)}
        >
          <option value="">Location / Vente</option>
          <option value="location">Location</option>
          <option value="vente">Vente</option>
          <option value="reservation">Réservation meublé</option>
        </Select>
        <Select defaultValue={searchParams.get("ville") ?? ""} onChange={(e) => update("ville", e.target.value)}>
          <option value="">Toutes les villes</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          defaultValue={searchParams.get("categorie") ?? ""}
          onChange={(e) => update("categorie", e.target.value)}
        >
          <option value="">Tous les types</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input
          type="number"
          placeholder="Budget min"
          defaultValue={searchParams.get("prixMin") ?? ""}
          onBlur={(e) => update("prixMin", e.target.value)}
        />
        <Input
          type="number"
          placeholder="Budget max"
          defaultValue={searchParams.get("prixMax") ?? ""}
          onBlur={(e) => update("prixMax", e.target.value)}
        />
        <Select
          defaultValue={searchParams.get("chambres") ?? ""}
          onChange={(e) => update("chambres", e.target.value)}
        >
          <option value="">Chambres</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </Select>
      </div>
      {activeCount > 0 && (
        <div className="mt-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
            <X className="h-3.5 w-3.5" /> Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
}
