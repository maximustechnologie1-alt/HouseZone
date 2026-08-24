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

export const metadata = { title: "Profil" };

const LINKS = [
  { href: "/favoris", label: "Favoris", icon: Heart },
  { href: "/visites", label: "Mes visites", icon: CalendarClock },
  { href: "/avis-de-recherche", label: "Avis de recherche", icon: ClipboardList },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profil/langue", label: "Langue", icon: Globe },
  { href: "/profil/parametres", label: "Paramètres du compte", icon: Settings },
];

export default async function ProfilePage() {
  const user = await requireUser("/profil");

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
          <ShieldCheck className="h-5 w-5 text-hz-gold" /> Devenir Hôte
        </Link>
      )}
      {user.role === "host" && (
        <Link
          href="/espace-hote"
          className="mt-6 flex items-center gap-3 rounded-card bg-hz-navy px-4 py-3 text-sm font-medium text-white"
        >
          <ShieldCheck className="h-5 w-5 text-hz-gold" /> Accéder à mon espace Hôte
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
          <LogOut className="h-4 w-4" /> Se déconnecter
        </button>
      </form>
    </div>
  );
}
