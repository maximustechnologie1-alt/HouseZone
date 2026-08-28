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
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {categories.map((c) => {
        const Icon = ICONS[c.slug] ?? Home;
        return (
          <Link
            key={c.id}
            href={`/recherche?categorie=${c.slug}`}
            className="flex shrink-0 items-center gap-2 rounded-full border border-hz-navy/10 bg-white px-4 py-2.5 text-sm font-medium text-hz-navy shadow-sm hover:border-hz-blue/30 hover:bg-hz-sky"
          >
            <Icon className="h-4 w-4 text-hz-blue" />
            {c.name}
          </Link>
        );
      })}
    </div>
  );
}
