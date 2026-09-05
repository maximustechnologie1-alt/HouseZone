"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/hooks/use-mounted";
import { LogoMark, Wordmark } from "@/components/ui/logo-mark";
import { HOST_NAV } from "@/components/host/host-nav-items";

// Drawer de navigation Hôte pour mobile/tablette (< lg). Le bouton hamburger
// s'affiche dans la HostTopbar ; la sidebar desktop reste la navigation
// principale au-dessus de lg.
export function HostNavDrawer({ unreadMessages = 0 }: { unreadMessages?: number }) {
  const [open, setOpen] = useState(false);
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
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full text-hz-navy hover:bg-hz-sky lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mounted &&
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
              aria-label="Navigation Hôte"
              className={cn(
                "fixed inset-y-0 left-0 z-[101] flex w-full max-w-xs flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden",
                open ? "translate-x-0" : "-translate-x-full"
              )}
            >
              <div className="flex items-center justify-between border-b border-hz-navy/10 px-4 py-4">
                <Link href="/" onClick={close} className="flex items-center gap-2">
                  <LogoMark size={28} />
                  <Wordmark />
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

              <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
                {HOST_NAV.map(({ href, label, icon: Icon, exact }) => {
                  const active = exact ? pathname === href : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={close}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                        active ? "bg-hz-sky text-hz-navy" : "text-hz-ink/70 hover:bg-hz-sky hover:text-hz-navy"
                      )}
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
                  );
                })}
              </nav>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
