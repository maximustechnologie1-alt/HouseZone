"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
  Building2,
  PlusCircle,
  MessageCircle,
  CalendarClock,
  BarChart3,
  CreditCard,
  Settings,
  Bell,
  Globe,
  Lock,
  ShieldAlert,
  HelpCircle,
  Flag,
  Mail,
  FileText,
  ScrollText,
} from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { useMounted } from "@/lib/hooks/use-mounted";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";

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

export function MainMenu({ user, isHost }: { user: Profile | null; isHost: boolean }) {
  const [open, setOpen] = useState(false);
  // The overlay/drawer are portaled to <body> (see return below) so their
  // `position: fixed` is measured against the viewport rather than being
  // trapped inside the header's box — any ancestor with a `filter` (our
  // sticky header uses `backdrop-blur`) creates a new containing block for
  // fixed descendants, which otherwise confines the drawer to the header's
  // small height instead of covering the screen. Portals need `document`,
  // which isn't available during SSR, hence the mounted gate.
  const mounted = useMounted();
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Every link inside the drawer already calls close() on click, but this
  // catches back/forward navigation and any other route change that
  // bypasses that handler — updating state during render (not in an effect)
  // to avoid an extra commit.
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
  }, [open]);

  const close = () => setOpen(false);

  const compteLinks: MenuLink[] = user
    ? [
        { href: "/profil", label: "Mon profil", icon: User },
        ...(isHost
          ? []
          : [{ href: "/devenir-hote", label: "Devenir Hôte", icon: ShieldCheck }]),
      ]
    : [
        { href: "/connexion", label: "Connexion", icon: LogIn },
        { href: "/inscription", label: "Inscription", icon: UserPlus },
        { href: "/devenir-hote", label: "Devenir Hôte", icon: ShieldCheck },
      ];

  const espaceHoteLinks: MenuLink[] = isHost
    ? [
        { href: "/espace-hote", label: "Tableau de bord", icon: LayoutDashboard },
        { href: "/espace-hote/annonces", label: "Mes annonces", icon: Building2 },
        { href: "/espace-hote/annonces/nouveau", label: "Publier un bien", icon: PlusCircle },
        { href: "/espace-hote/messages", label: "Messages clients", icon: MessageCircle },
        { href: "/espace-hote/visites", label: "Demandes de visite", icon: CalendarClock },
        { href: "/espace-hote/statistiques", label: "Statistiques", icon: BarChart3 },
        { href: "/espace-hote/abonnement", label: "Abonnement", icon: CreditCard },
        { href: "/espace-hote/profil", label: "Paramètres Hôte", icon: Settings },
      ]
    : [];

  const parametresLinks: MenuLink[] = user
    ? [
        { href: "/profil/parametres", label: "Compte", icon: User },
        { href: "/notifications", label: "Notifications", icon: Bell },
        { href: "/profil/langue", label: "Langue", icon: Globe },
        ...(isHost ? [{ href: "/espace-hote/paiements", label: "Paiements", icon: CreditCard }] : []),
        { href: "/profil/parametres", label: "Sécurité", icon: Lock },
        { href: "/confidentialite", label: "Confidentialité", icon: ShieldAlert },
      ]
    : [];

  const aideLinks: MenuLink[] = [
    { href: "/aide", label: "Centre d'aide", icon: HelpCircle },
    { href: "/aide#securite", label: "Sécurité HouseZone", icon: ShieldCheck },
    { href: "/aide#signaler", label: "Signaler un problème", icon: Flag },
    { href: "/aide#contact", label: "Nous contacter", icon: Mail },
  ];

  const legalLinks: MenuLink[] = [
    { href: "/conditions-utilisation", label: "Conditions d'utilisation", icon: FileText },
    { href: "/confidentialite", label: "Politique de confidentialité", icon: ScrollText },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full text-hz-navy hover:bg-hz-sky"
      >
        <Menu className="h-5.5 w-5.5" />
      </button>

      {mounted &&
        createPortal(
          <>
            <div
              className={cn(
                "fixed inset-0 z-[100] bg-hz-navy/40 transition-opacity",
                open ? "opacity-100" : "pointer-events-none opacity-0"
              )}
              onClick={close}
              aria-hidden={!open}
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-label="Menu HouseZone"
              className={cn(
                "fixed inset-y-0 right-0 z-[101] flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out",
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
                  aria-label="Fermer le menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-hz-navy hover:bg-hz-sky"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto py-4">
                <MenuSection title="Compte" links={compteLinks} onNavigate={close} />
                <MenuSection title="Espace Hôte" links={espaceHoteLinks} onNavigate={close} />
                <MenuSection title="Paramètres" links={parametresLinks} onNavigate={close} />
                <MenuSection title="Aide" links={aideLinks} onNavigate={close} />
                <MenuSection title="Légal" links={legalLinks} onNavigate={close} />
              </div>

              {user && (
                <div className="border-t border-hz-navy/10 p-4">
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4.5 w-4.5" /> Déconnexion
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>,
          document.body
        )}
    </>
  );
}
