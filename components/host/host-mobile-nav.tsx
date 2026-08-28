"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, ClipboardList, MessageCircle, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function HostMobileNav({ unreadMessages = 0 }: { unreadMessages?: number }) {
  const pathname = usePathname();

  const items = [
    { href: "/espace-hote", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/espace-hote/annonces", label: "Annonces", icon: Building2 },
    { href: "/espace-hote/avis-de-recherche", label: "Avis", icon: ClipboardList },
    { href: "/espace-hote/messages", label: "Messages", icon: MessageCircle, badge: unreadMessages },
    { href: "/espace-hote/profil", label: "Profil", icon: UserCircle },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hz-navy/10 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, exact, badge }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-hz-blue" : "text-hz-ink/50"
              )}
            >
              <span className="relative">
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                {Boolean(badge) && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-hz-gold px-1 text-[9px] font-bold text-hz-navy">
                    {(badge ?? 0) > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
