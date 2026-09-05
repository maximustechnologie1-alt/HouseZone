"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { City } from "@/lib/types/database";

/** Normalise pour une recherche tolérante casse + accents. */
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

interface CityComboboxProps {
  cities: City[];
  value: string;
  onChange: (cityId: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  allLabel: string;
}

export function CityCombobox({
  cities,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  allLabel,
}: CityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = cities.find((c) => c.id === value);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return cities;
    return cities.filter((c) => normalize(c.name).includes(q));
  }, [cities, query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function select(cityId: string) {
    onChange(cityId);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center justify-between gap-2 rounded-xl border border-hz-navy/15 bg-white px-3 py-2.5 text-left text-sm text-hz-ink outline-none focus:border-hz-blue focus:ring-2 focus:ring-hz-blue/20"
        >
          <span className={cn("truncate", !selected && "text-hz-ink/40")}>
            {selected ? selected.name : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-hz-ink/50" />
        </button>
        {selected && (
          <button
            type="button"
            onClick={() => select("")}
            aria-label={allLabel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-hz-navy hover:bg-hz-sky"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-hz-navy/15 bg-white shadow-lg shadow-hz-navy/10">
          <div className="flex items-center gap-2 border-b border-hz-navy/10 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-hz-ink/50" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-hz-ink outline-none placeholder:text-hz-ink/40"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1" role="listbox">
            <li>
              <button
                type="button"
                onClick={() => select("")}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-hz-ink/70 hover:bg-hz-sky"
              >
                {allLabel}
                {!value && <Check className="h-4 w-4 text-hz-blue" />}
              </button>
            </li>
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => select(c.id)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-hz-ink hover:bg-hz-sky"
                >
                  {c.name}
                  {c.id === value && <Check className="h-4 w-4 text-hz-blue" />}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-center text-sm text-hz-ink/50">—</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
