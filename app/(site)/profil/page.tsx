import Link from "next/link";
import {
  Bell,
  CalendarClock,
  ClipboardList,
  Globe,
  Heart,
  LogOut,
  MessageCircle,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/auth";
import { initials } from "@/lib/utils";
import { getServerLocale } from "@/lib/i18n/get-locale";
import { DICTIONARIES } from "@/lib/i18n/registry";

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  const [user, locale] = await Promise.all([requireUser("/profil"), getServerLocale()]);
  const t = DICTIONARIES[locale];

  const LINKS = [
    { href: "/favoris", label: t.nav.favorites, icon: Heart },
    { href: "/visites", label: t.profile.my_visits, icon: CalendarClock },
    { href: "/avis-de-recherche", label: t.nav.reviews, icon: ClipboardList },
    { href: "/messages", label: t.nav.messages, icon: MessageCircle },
    { href: "/notifications", label: t.nav.notifications, icon: Bell },
    { href: "/profil/langue", label: t.profile.language_link, icon: Globe },
    { href: "/profil/parametres", label: t.profile.account_settings, icon: Settings },
  ];

  return (
    <div className="hz-container max-w-xl py-8">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-hz-navy text-xl font-semibold text-white">
          {initials(user.first_name, user.last_name)}
        </span>
        <div>
          <p className="text-lg font-semibold text-hz-navy">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-sm text-hz-ink/60">{user.email}</p>
        </div>
      </div>

      {user.role !== "host" && (
        <Link
          href="/devenir-hote"
          className="mt-6 flex items-center gap-3 rounded-card bg-hz-navy px-4 py-3 text-sm font-medium text-white"
        >
          <ShieldCheck className="h-5 w-5 text-hz-gold" /> {t.nav.become_host}
        </Link>
      )}
      {user.role === "host" && (
        <Link
          href="/espace-hote"
          className="mt-6 flex items-center gap-3 rounded-card bg-hz-navy px-4 py-3 text-sm font-medium text-white"
        >
          <ShieldCheck className="h-5 w-5 text-hz-gold" /> {t.profile.access_host_space}
        </Link>
      )}

      <div className="mt-6 divide-y divide-hz-navy/10 rounded-card border border-hz-navy/10 bg-white">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3 text-sm text-hz-ink hover:bg-hz-sky/40">
            <Icon className="h-4.5 w-4.5 text-hz-navy/60" /> {label}
          </Link>
        ))}
      </div>

      <form action={signOutAction} className="mt-6">
        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
          <LogOut className="h-4 w-4" /> {t.nav.logout}
        </button>
      </form>
    </div>
  );
}
