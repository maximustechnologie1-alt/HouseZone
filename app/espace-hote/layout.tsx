import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  CalendarClock,
  MessageCircle,
  ClipboardList,
  BarChart3,
  CreditCard,
  UserCircle,
  Sparkles,
} from "lucide-react";
import { requireHost } from "@/lib/auth";
import { HostMobileNav } from "@/components/host/host-mobile-nav";
import { HostTopbar } from "@/components/host/host-topbar";
import { LogoMark } from "@/components/ui/logo-mark";
import { getUnreadMessageCount } from "@/lib/data/messages";

const NAV = [
  { href: "/espace-hote", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/espace-hote/annonces", label: "Mes annonces", icon: Building2 },
  { href: "/espace-hote/visites", label: "Visites", icon: CalendarClock },
  { href: "/espace-hote/messages", label: "Messages", icon: MessageCircle },
  { href: "/espace-hote/avis-de-recherche", label: "Avis de recherche", icon: ClipboardList },
  { href: "/espace-hote/statistiques", label: "Statistiques", icon: BarChart3 },
  { href: "/espace-hote/abonnement", label: "Abonnement", icon: CreditCard },
  { href: "/espace-hote/premium", label: "Premium", icon: Sparkles },
  { href: "/espace-hote/profil", label: "Profil professionnel", icon: UserCircle },
];

export default async function HostLayout({ children }: LayoutProps<"/">) {
  const { profile, hostProfile } = await requireHost();
  const unreadMessages = await getUnreadMessageCount(profile.id);

  return (
    <div className="flex min-h-screen bg-hz-sky/30">
      <aside className="hidden w-64 shrink-0 border-r border-hz-navy/10 bg-white p-5 lg:block">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark size={36} />
          <span className="text-lg font-semibold text-hz-navy">HouseZone</span>
        </Link>
        <nav className="mt-8 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-hz-ink/70 hover:bg-hz-sky hover:text-hz-navy"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4.5 w-4.5" /> {label}
              </span>
              {href === "/espace-hote/messages" && unreadMessages > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-hz-gold px-1 text-[10px] font-bold text-hz-navy">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <HostTopbar profile={profile} hostProfile={hostProfile} />
        <main className="p-4 pb-20 sm:p-6 lg:pb-6">{children}</main>
      </div>
      <HostMobileNav unreadMessages={unreadMessages} />
    </div>
  );
}
