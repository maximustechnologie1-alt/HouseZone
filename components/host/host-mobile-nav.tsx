"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, ClipboardList, MessageCircle, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/espace-hote", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/espace-hote/annonces", label: "Annonces", icon: Building2 },
  { href: "/espace-hote/avis-de-recherche", label: "Avis", icon: ClipboardList },
  { href: "/espace-hote/messages", label: "Messages", icon: MessageCircle },
  { href: "/espace-hote/profil", label: "Profil", icon: UserCircle },
];

export function HostMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hz-navy/10 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
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
