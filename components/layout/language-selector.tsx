"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { getLocaleMeta, isLocaleCode } from "@/lib/i18n/locales";
import type { Language } from "@/lib/types/database";

// `languages` is the DB-driven roster (supabase table `languages`,
// admin-managed at /admin/langues). As of V1 all ten languages in the
// registry (see locales.ts) ship active — every option here is selectable,
// none rendered as "coming soon".
export function LanguageSelector({ languages }: { languages: Language[] }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const current = getLocaleMeta(locale);
  const options = languages.filter((l) => isLocaleCode(l.code) && l.active);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("common.select_language")}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-hz-navy hover:bg-hz-sky"
      >
        <Globe className="h-4 w-4" />
        {current.nativeName}
      </button>

      <div
        role="menu"
        aria-label={t("common.select_language")}
        className={cn(
          "absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl border border-hz-navy/10 bg-white p-2 shadow-xl transition",
          open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        )}
      >
        {options.map((lang) => {
          const meta = getLocaleMeta(lang.code);
          const active = lang.code === locale;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLocale(meta.code);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-hz-ink/85 hover:bg-hz-sky",
                active && "bg-hz-sky"
              )}
            >
              <span className="flex items-center gap-2">
                <span aria-hidden="true">{meta.flag}</span>
                {meta.nativeName}
              </span>
              {active && <Check className="h-4 w-4 text-hz-blue" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
