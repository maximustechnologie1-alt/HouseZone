"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useMounted } from "@/lib/hooks/use-mounted";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useMounted();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  // Portaled to <body>: `position: fixed` here would otherwise be measured
  // against the nearest ancestor with a `filter`/`backdrop-blur` (e.g. the
  // sticky site header), which traps the modal inside that ancestor's box
  // instead of covering the viewport.
  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-hz-navy/40 p-0 sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl sm:max-w-md sm:rounded-card"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-hz-navy">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-full p-1 hover:bg-hz-sky">
            <X className="h-5 w-5 text-hz-navy" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
