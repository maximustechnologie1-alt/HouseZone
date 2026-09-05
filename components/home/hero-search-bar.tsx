"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { AdvancedSearchSheet } from "@/components/search/advanced-search-sheet";
import type { City, PropertyCategory } from "@/lib/types/database";

export function HeroSearchBar({
  cities,
  categories,
}: {
  cities: City[];
  categories: PropertyCategory[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [categorie, setCategorie] = useState("");
  const [operation, setOperation] = useState("");
  const [budget, setBudget] = useState("");

  // Purement visuel : détecte quand la barre sort sous le header sticky
  // pour afficher une copie fixe (mêmes states/handlers, aucune logique dupliquée).
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
      rootMargin: "-65px 0px 0px 0px",
      threshold: 0,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  function runSearch() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (categorie) params.set("categorie", categorie);
    if (operation) params.set("operation", operation);
    if (budget) params.set("prixMax", budget);
    router.push(`/recherche${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const bars = (
    <>
      {/* Mobile / tablette : barre unique, ouvre la recherche avancée */}
      <div className="flex w-full items-center gap-2 rounded-full bg-white p-2 shadow-xl shadow-hz-navy/10 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-full px-3 py-2.5 text-left"
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
            placeholder="Rechercher un bien, quartier…"
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

      {/* Desktop : champs inline (type de bien, offre, budget) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch();
        }}
        className="hidden w-full items-center gap-3 rounded-full bg-white p-2.5 shadow-xl shadow-hz-navy/10 lg:flex"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 pl-4">
          <Search className="h-5 w-5 shrink-0 text-hz-blue" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un bien, quartier…"
            className="w-full bg-transparent text-sm text-hz-ink outline-none placeholder:text-hz-ink/40"
          />
        </div>

        <span className="h-8 w-px shrink-0 bg-hz-navy/10" />
        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          aria-label="Type de bien"
          className="min-w-[8rem] shrink-0 rounded-full bg-transparent px-3 py-2 text-sm text-hz-ink outline-none"
        >
          <option value="">Type de bien</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <span className="h-8 w-px shrink-0 bg-hz-navy/10" />
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          aria-label="Offre"
          className="min-w-[6rem] shrink-0 rounded-full bg-transparent px-3 py-2 text-sm text-hz-ink outline-none"
        >
          <option value="">Offre</option>
          <option value="location">Louer</option>
          <option value="vente">Acheter</option>
        </select>

        <span className="h-8 w-px shrink-0 bg-hz-navy/10" />
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={1000}
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          aria-label="Budget maximum"
          placeholder="Budget max (FCFA)"
          className="w-28 shrink-0 rounded-full bg-transparent px-3 py-2 text-sm text-hz-ink outline-none placeholder:text-hz-ink/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        <button
          type="submit"
          className="flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-hz-blue px-5 text-sm font-medium text-white transition-colors hover:bg-hz-navy"
        >
          <Search className="h-4 w-4" />
          Rechercher
        </button>
      </form>
    </>
  );

  return (
    <>
      {/* Repère invisible : marque la position d'origine de la barre */}
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />

      {/* Barre à sa position normale dans le Hero (masquée sans perdre son espace
          une fois que la copie fixe prend le relais, pour éviter tout saut de mise en page) */}
      <div className={stuck ? "invisible" : ""}>{bars}</div>

      {/* Copie fixe : apparaît sous le header dès que la barre sort de l'écran */}
      <div
        aria-hidden={!stuck}
        className={`fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] z-30 border-b border-hz-navy/10 bg-white/95 py-2 shadow-md shadow-hz-navy/10 backdrop-blur transition-all duration-200 ${
          stuck ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="hz-container lg:mx-auto lg:max-w-3xl">{stuck ? bars : null}</div>
      </div>

      <AdvancedSearchSheet
        open={open}
        onClose={() => setOpen(false)}
        cities={cities}
        categories={categories}
      />
    </>
  );
}
