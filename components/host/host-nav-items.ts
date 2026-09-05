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

// Navigation de l'espace Hôte — source unique partagée par la sidebar desktop
// (espace-hote/layout.tsx) et le drawer mobile (host-nav-drawer.tsx).
export const HOST_NAV: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}[] = [
  { href: "/espace-hote", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/espace-hote/annonces", label: "Mes annonces", icon: Building2 },
  { href: "/espace-hote/visites", label: "Visites", icon: CalendarClock },
  { href: "/espace-hote/messages", label: "Messages", icon: MessageCircle },
  { href: "/espace-hote/avis-de-recherche", label: "Avis de recherche", icon: ClipboardList },
  { href: "/espace-hote/statistiques", label: "Statistiques", icon: BarChart3 },
  { href: "/espace-hote/abonnement", label: "Abonnement", icon: CreditCard },
  { href: "/espace-hote/premium", label: "Premium", icon: Sparkles },
  { href: "/espace-hote/profil", label: "Profil professionnel", icon: UserCircle },
];
