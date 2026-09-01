"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
  HelpCircle,
  ClipboardList,
  CalendarCheck,
  Heart,
  MessageCircle,
} from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import type { Profile } from "@/lib/types/database";

interface MenuLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function MenuItem({ href, label, icon: Icon, onNavigate }: MenuLink & { onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-hz-ink/85 hover:bg-hz-sky"
    >
      <Icon className="h-4 w-4 text-hz-navy/60" />
      {label}
    </Link>
  );
}

// Desktop-only (>= 1024px) avatar dropdown — the desktop equivalent of the
// mobile drawer, but scoped to a small popover instead of a full-screen
// slide-over, and with different content per the desktop nav spec.
export function DesktopUserMenu({
  user,
  isHost,
  messagesHref,
}: {
  user: Profile | null;
  isHost: boolean;
  messagesHref: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : "";

  const compteLinks: MenuLink[] = [
    { href: "/visites", label: t("nav.my_reservations"), icon: CalendarCheck },
    { href: "/favoris", label: t("nav.favorites"), icon: Heart },
    { href: messagesHref, label: t("nav.messages"), icon: MessageCircle },
  ];

  const hoteLinks: MenuLink[] = isHost
    ? [{ href: "/espace-hote", label: t("nav.host_dashboard"), icon: LayoutDashboard }]
    : [{ href: "/devenir-hote", label: t("nav.become_host"), icon: ShieldCheck }];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("nav.user_menu")}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-hz-navy/15 text-hz-navy hover:bg-hz-sky"
      >
        {user?.avatar_url ? (
          <Image src={user.avatar_url} alt="" width={40} height={40} className="h-full w-full rounded-full object-cover" />
        ) : (
          <User className="h-5 w-5" />
        )}
      </button>

      <div
        role="menu"
        className={cn(
          "absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl border border-hz-navy/10 bg-white p-2 shadow-xl transition",
          open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        )}
      >
        {user ? (
          <>
            <div className="px-3 py-2">
              <p className="truncate text-sm font-semibold text-hz-navy">{fullName}</p>
              {user.email && <p className="truncate text-xs text-hz-ink/60">{user.email}</p>}
            </div>
            <div className="my-1 border-t border-hz-navy/10" />
            {compteLinks.map((link) => (
              <MenuItem key={link.href} {...link} onNavigate={close} />
            ))}
            <div className="my-1 border-t border-hz-navy/10" />
            {hoteLinks.map((link) => (
              <MenuItem key={link.href} {...link} onNavigate={close} />
            ))}
            <MenuItem href="/profil" label={t("nav.manage_profile")} icon={User} onNavigate={close} />
            <div className="my-1 border-t border-hz-navy/10" />
            <MenuItem href="/aide" label={t("nav.help_center")} icon={HelpCircle} onNavigate={close} />
            <div className="my-1 border-t border-hz-navy/10" />
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> {t("nav.logout")}
              </button>
            </form>
          </>
        ) : (
          <>
            <MenuItem href="/connexion" label={t("nav.login")} icon={LogIn} onNavigate={close} />
            <MenuItem href="/inscription" label={t("nav.signup")} icon={UserPlus} onNavigate={close} />
            <div className="my-1 border-t border-hz-navy/10" />
            <MenuItem href="/avis-de-recherche" label={t("nav.reviews")} icon={ClipboardList} onNavigate={close} />
            <MenuItem href="/aide" label={t("nav.help_center")} icon={HelpCircle} onNavigate={close} />
          </>
        )}
      </div>
    </div>
  );
}
