"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Search, User, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/recherche", label: "Recherche", icon: Search },
  { href: "/avis-de-recherche", label: "Avis", icon: ClipboardList },
  { href: "/favoris", label: "Favoris", icon: Heart },
  { href: "/profil", label: "Profil", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hz-navy/10 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-hz-blue" : "text-hz-ink/50"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
