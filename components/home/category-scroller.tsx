import Link from "next/link";
import { Building2, Home, Landmark, Sofa, Warehouse } from "lucide-react";
import type { PropertyCategory } from "@/lib/types/database";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  studio: Home,
  "chambre-salon": Home,
  "mini-villa": Home,
  villa: Home,
  duplex: Warehouse,
  appartement: Building2,
  "appartement-meuble": Sofa,
  residence: Landmark,
  "residence-meublee": Sofa,
  terrain: Landmark,
};

export function CategoryScroller({ categories }: { categories: PropertyCategory[] }) {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-4 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((c) => {
        const Icon = ICONS[c.slug] ?? Home;
        return (
          <Link
            key={c.id}
            href={`/recherche?categorie=${c.slug}`}
            className="group flex w-20 shrink-0 flex-col items-center gap-1.5 sm:w-24"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-hz-navy/10 bg-white shadow-sm transition-colors group-hover:border-hz-blue/30 group-hover:bg-hz-sky sm:h-16 sm:w-16">
              <Icon className="h-6 w-6 text-hz-blue" />
            </span>
            <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight text-hz-navy sm:text-xs">
              {c.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
