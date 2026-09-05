"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, MessageCircle, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavDrawer } from "@/components/layout/nav-drawer-context";
import { useI18n } from "@/lib/i18n/context";

export function MobileBottomNav({
  messagesHref = "/messages",
  unreadMessages = 0,
}: {
  messagesHref?: string;
  unreadMessages?: number;
}) {
  const pathname = usePathname();
  const { open: drawerOpen, setOpen: setDrawerOpen } = useNavDrawer();
  const { t } = useI18n();

  const items: { href: string; label: string; icon: typeof Home; exact?: boolean; badge?: number }[] = [
    { href: "/", label: t("nav.home"), icon: Home, exact: true },
    { href: "/recherche", label: t("nav.search"), icon: Search },
    { href: "/favoris", label: t("nav.favorites"), icon: Heart },
    { href: messagesHref, label: t("nav.messages"), icon: MessageCircle, badge: unreadMessages },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hz-navy/10 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, exact, badge }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={label}
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
        <button
          type="button"
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label={t("nav.open_profile_menu")}
          aria-expanded={drawerOpen}
          className={cn(
            "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
            drawerOpen ? "text-hz-blue" : "text-hz-ink/50"
          )}
        >
          <User className="h-5 w-5" strokeWidth={drawerOpen ? 2.5 : 2} />
          {t("nav.profile")}
        </button>
      </div>
    </nav>
  );
}
