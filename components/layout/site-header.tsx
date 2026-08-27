import Link from "next/link";
import { Bell, Heart, MessageCircle, Search } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { LinkButton } from "@/components/ui/button";
import { initials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { LogoMark } from "@/components/ui/logo-mark";

export async function SiteHeader() {
  const user = await getCurrentUser();

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
    <header className="sticky top-0 z-40 border-b border-hz-navy/10 bg-white/95 backdrop-blur">
      <div className="hz-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <LogoMark size={36} />
          <span className="hidden text-lg font-semibold text-hz-navy sm:inline">HouseZone</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-hz-navy md:flex">
          <Link href="/recherche" className="hover:text-hz-blue">
            Rechercher
          </Link>
          <Link href="/avis-de-recherche" className="hover:text-hz-blue">
            Avis de recherche
          </Link>
          {user?.role === "host" ? (
            <Link href="/espace-hote" className="hover:text-hz-blue">
              Espace Hôte
            </Link>
          ) : (
            <Link href="/devenir-hote" className="hover:text-hz-blue">
              Devenir Hôte
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/favoris"
                className="hidden h-10 w-10 items-center justify-center rounded-full text-hz-navy hover:bg-hz-sky sm:flex"
                aria-label="Favoris"
              >
                <Heart className="h-5 w-5" />
              </Link>
              <Link
                href="/messages"
                className="hidden h-10 w-10 items-center justify-center rounded-full text-hz-navy hover:bg-hz-sky sm:flex"
                aria-label="Messages"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
              <Link
                href="/notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-hz-navy hover:bg-hz-sky"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-hz-gold" />
                )}
              </Link>
              <Link
                href="/profil"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-hz-navy text-sm font-semibold text-white"
              >
                {initials(user.first_name, user.last_name)}
              </Link>
            </>
          ) : (
            <>
              <LinkButton href="/connexion" variant="ghost" size="sm">
                Connexion
              </LinkButton>
              <LinkButton href="/inscription" variant="primary" size="sm">
                S&apos;inscrire
              </LinkButton>
            </>
          )}
        </div>
      </div>
      <div className="border-t border-hz-navy/5 bg-hz-sky/40 px-4 py-2 md:hidden">
        <Link
          href="/recherche"
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-hz-ink/60 shadow-sm"
        >
          <Search className="h-4 w-4" /> Que recherchez-vous ?
        </Link>
      </div>
    </header>
  );
}
