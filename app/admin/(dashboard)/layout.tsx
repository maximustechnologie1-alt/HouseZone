import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building2,
  Flag,
  CreditCard,
  Receipt,
  ClipboardList,
  BarChart3,
  ScrollText,
  Settings,
  Tags,
  Languages,
  Sparkles,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";
import { LogoMark } from "@/components/ui/logo-mark";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/admin/hotes", label: "Hôtes & vérifications", icon: ShieldCheck },
  { href: "/admin/annonces", label: "Annonces", icon: Building2 },
  { href: "/admin/signalements", label: "Signalements", icon: Flag },
  { href: "/admin/paiements", label: "Paiements", icon: CreditCard },
  { href: "/admin/abonnements", label: "Abonnements", icon: Receipt },
  { href: "/admin/premium", label: "Premium", icon: Sparkles },
  { href: "/admin/avis-de-recherche", label: "Avis de recherche", icon: ClipboardList },
  { href: "/admin/statistiques", label: "Statistiques", icon: BarChart3 },
  { href: "/admin/journal-audit", label: "Journal d'audit", icon: ScrollText },
  { href: "/admin/categories", label: "Catégories & villes", icon: Tags },
  { href: "/admin/langues", label: "Langues", icon: Languages },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

export default async function AdminDashboardLayout({ children }: LayoutProps<"/">) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="hidden w-64 shrink-0 border-r border-hz-navy/10 bg-hz-navy p-5 text-white lg:block">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark size={36} />
          <span className="text-lg font-semibold">HouseZone Admin</span>
        </Link>
        <nav className="mt-8 space-y-0.5 text-sm">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Icon className="h-4.5 w-4.5" /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-hz-navy/10 bg-white px-4 sm:px-6">
          <p className="text-sm font-medium text-hz-navy lg:hidden">HouseZone Admin</p>
          <div className="ml-auto">
            <AdminUserMenu profile={admin} />
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
