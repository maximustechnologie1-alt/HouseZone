"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  User,
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Mail,
  FileText,
  ScrollText,
} from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { useMounted } from "@/lib/hooks/use-mounted";
import { useNavDrawer } from "@/components/layout/nav-drawer-context";
import { useI18n } from "@/lib/i18n/context";
import { LogoMark } from "@/components/ui/logo-mark";
import { LanguageSelector } from "@/components/layout/language-selector";
import { cn } from "@/lib/utils";
import type { Language, Profile } from "@/lib/types/database";

interface MenuLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function MenuSection({ title, links, onNavigate }: { title: string; links: MenuLink[]; onNavigate: () => void }) {
  if (links.length === 0) return null;
  return (
    <div>
      <p className="px-4 text-xs font-semibold uppercase tracking-wide text-hz-ink/40">{title}</p>
      <div className="mt-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-hz-ink/85 hover:bg-hz-sky"
          >
            <Icon className="h-4.5 w-4.5 text-hz-navy/60" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// Mobile-only slide-over drawer, opened from the "Profil" tab of the bottom
// navigation (see mobile-bottom-nav.tsx) — it has no trigger button of its
// own. Favoris / Messages / Avis de recherche are intentionally absent here
// since they already live in the bottom navigation; duplicating them would
// give the user two paths to the same screen.
export function MobileDrawer({
  user,
  isHost,
  languages,
}: {
  user: Profile | null;
  isHost: boolean;
  languages: Language[];
}) {
  const { open, setOpen } = useNavDrawer();
  const { t } = useI18n();
  // Portaled to <body> for the same reason the old MainMenu drawer was: a
  // sticky/backdrop-blur ancestor creates a containing block for `fixed`
  // descendants, which would otherwise confine the drawer to the header.
  const mounted = useMounted();
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  const close = () => setOpen(false);

  const hoteLinks: MenuLink[] = isHost
    ? [{ href: "/espace-hote", label: t("nav.host_dashboard"), icon: LayoutDashboard }]
    : [{ href: "/devenir-hote", label: t("nav.become_host"), icon: ShieldCheck }];

  const compteLinks: MenuLink[] = user
    ? [
        { href: "/profil", label: t("nav.manage_profile"), icon: User },
        { href: "/profil/parametres", label: t("nav.settings"), icon: Settings },
      ]
    : [];

  const supportLinks: MenuLink[] = [
    { href: "/aide", label: t("nav.help_center"), icon: HelpCircle },
    { href: "/aide#securite", label: t("nav.security"), icon: ShieldCheck },
    { href: "/aide#contact", label: t("nav.contact_us"), icon: Mail },
    { href: "/conditions-utilisation", label: t("nav.terms"), icon: FileText },
    { href: "/confidentialite", label: t("nav.privacy"), icon: ScrollText },
  ];

  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : "";

  return (
    mounted &&
    createPortal(
      <>
        <div
          className={cn(
            "fixed inset-0 z-[100] bg-hz-navy/40 transition-opacity lg:hidden",
            open ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          onClick={close}
          aria-hidden={!open}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="HouseZone"
          className={cn(
            "fixed inset-y-0 right-0 z-[101] flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-hz-navy/10 px-4 py-4">
            <Link href="/" onClick={close} className="flex items-center gap-2">
              <LogoMark size={32} />
              <span className="font-semibold text-hz-navy">HouseZone</span>
            </Link>
            <button
              type="button"
              onClick={close}
              aria-label={t("nav.close_menu")}
              className="flex h-9 w-9 items-center justify-center rounded-full text-hz-navy hover:bg-hz-sky"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-3 border-b border-hz-navy/10 px-4 py-4">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-hz-sky text-base font-semibold text-hz-navy">
                  {fullName.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-hz-navy">{fullName}</p>
                {user.email && <p className="truncate text-xs text-hz-ink/60">{user.email}</p>}
              </div>
            </div>
          ) : (
            <div className="flex gap-2 border-b border-hz-navy/10 px-4 py-4">
              <Link
                href="/connexion"
                onClick={close}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-hz-navy/20 py-2.5 text-sm font-medium text-hz-navy hover:bg-hz-sky"
              >
                <LogIn className="h-4 w-4" /> {t("nav.login")}
              </Link>
              <Link
                href="/inscription"
                onClick={close}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-hz-blue py-2.5 text-sm font-medium text-white hover:bg-hz-navy"
              >
                <UserPlus className="h-4 w-4" /> {t("nav.signup")}
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2 border-b border-hz-navy/10 px-4 py-3">
            <LanguageSelector languages={languages} />
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto py-4">
            <MenuSection title={t("nav.host_section")} links={hoteLinks} onNavigate={close} />
            <MenuSection title={t("nav.account_section")} links={compteLinks} onNavigate={close} />
            <MenuSection title={t("nav.support_section")} links={supportLinks} onNavigate={close} />
          </div>

          {user && (
            <div className="border-t border-hz-navy/10 p-4">
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4.5 w-4.5" /> {t("nav.logout")}
                </button>
              </form>
            </div>
          )}
        </div>
      </>,
      document.body
    )
  );
}
