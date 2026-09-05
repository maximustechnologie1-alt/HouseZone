import Link from "next/link";
import { Bell } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getServerLocale } from "@/lib/i18n/get-locale";
import { DICTIONARIES } from "@/lib/i18n/registry";
import { getLanguages } from "@/lib/data/languages";
import { LogoMark, Wordmark } from "@/components/ui/logo-mark";
import { LinkButton } from "@/components/ui/button";
import { DesktopUserMenu } from "@/components/layout/desktop-user-menu";
import { LanguageSelector } from "@/components/layout/language-selector";

export async function SiteHeader() {
  const [user, locale, languages] = await Promise.all([getCurrentUser(), getServerLocale(), getLanguages()]);
  const t = DICTIONARIES[locale];
  const isHost = user?.role === "host";
  const messagesHref = isHost ? "/espace-hote/messages" : "/messages";

  const primaryNav = [
    { href: "/recherche?operation=vente", label: t.nav.buy },
    { href: "/recherche?operation=location", label: t.nav.rent },
    { href: "/recherche?categorie=terrain", label: t.nav.lands },
    { href: "/recherche?meuble=1", label: t.nav.hotels },
    { href: "/avis-de-recherche", label: t.nav.reviews },
  ];

  let unreadCount = 0;
  if (user) {
    const supabase = await createClient();
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    unreadCount = count ?? 0;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-hz-navy/10 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="hz-container flex h-16 min-h-16 items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2">
          <LogoMark size={32} />
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-hz-ink/70 transition-colors hover:bg-hz-sky hover:text-hz-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <Link
              href="/notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-hz-navy hover:bg-hz-sky"
              aria-label={t.nav.notifications}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-hz-gold" />}
            </Link>
          )}

          {/* Desktop nav (>= 1024px): CTA, language, user dropdown.
              No hamburger — the mobile drawer is opened from the bottom nav's
              Profil tab and never shown at this breakpoint.
              "Devenir Hôte" for non-hosts still lives in the DesktopUserMenu. */}
          <div className="hidden items-center gap-2 lg:flex">
            <LinkButton
              href={isHost ? "/espace-hote/annonces/nouveau" : "/devenir-hote"}
              variant="primary"
              size="sm"
            >
              {t.nav.publish_listing}
            </LinkButton>
            <LanguageSelector languages={languages} />
            <DesktopUserMenu user={user} isHost={isHost} messagesHref={messagesHref} />
          </div>
        </div>
      </div>
    </header>
  );
}
