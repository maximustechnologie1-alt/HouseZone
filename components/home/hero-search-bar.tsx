"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { AdvancedSearchSheet } from "@/components/search/advanced-search-sheet";
import type { City, Neighborhood, PropertyCategory } from "@/lib/types/database";

export function HeroSearchBar({
  cities,
  neighborhoods,
  categories,
}: {
  cities: City[];
  neighborhoods: Neighborhood[];
  categories: PropertyCategory[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  return (
    <>
      <div className="flex items-center gap-2 rounded-full bg-white p-2 shadow-xl shadow-hz-navy/10">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-1 items-center gap-3 rounded-full px-3 py-2.5 text-left"
        >
          <Search className="h-5 w-5 shrink-0 text-hz-blue" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter" && q.trim()) {
                router.push(`/recherche?q=${encodeURIComponent(q.trim())}`);
              }
            }}
            placeholder="Que recherchez-vous ?"
            className="w-full bg-transparent text-sm text-hz-ink outline-none placeholder:text-hz-ink/40"
          />
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Recherche avancée"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-hz-blue text-white"
        >
          <SlidersHorizontal className="h-4.5 w-4.5" />
        </button>
      </div>

      <AdvancedSearchSheet
        open={open}
        onClose={() => setOpen(false)}
        cities={cities}
        neighborhoods={neighborhoods}
        categories={categories}
      />
    </>
  );
}
