"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";
import { DICTIONARIES } from "./registry";
import { getLocaleMeta, type LocaleCode } from "./locales";
import { LOCALE_COOKIE } from "./locale-cookie";
import { updateLanguageAction } from "@/lib/actions/profile";
import type { TranslationKey } from "./types";

interface I18nContextValue {
  locale: LocaleCode;
  dir: "ltr" | "rtl";
  t: (key: TranslationKey) => string;
  setLocale: (locale: LocaleCode) => void;
  pending: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readByPath(obj: unknown, path: string[]): unknown {
  return path.reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), obj);
}

// Wraps the whole app (see app/layout.tsx) with the locale resolved
// server-side so there's no flash of the wrong language on first paint.
// Switching locale afterwards is purely client-side — the dictionary is
// already in the bundle (see registry.ts) — so the UI updates instantly;
// the cookie write and (for signed-in users) the profile update just make
// that choice stick for next time, they don't gate the visible change.
export function I18nProvider({
  initialLocale,
  isAuthenticated,
  children,
}: {
  initialLocale: LocaleCode;
  isAuthenticated: boolean;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<LocaleCode>(initialLocale);
  const [, startTransition] = useTransition();
  const [pending, setPending] = useState(false);

  const setLocale = useCallback(
    (next: LocaleCode) => {
      setLocaleState(next);
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = next;
      document.documentElement.dir = getLocaleMeta(next).dir;

      if (!isAuthenticated) return;
      // Best-effort sync to the profile so the choice follows a signed-in
      // user across devices; the visible switch above already happened.
      setPending(true);
      startTransition(async () => {
        await updateLanguageAction(next).catch(() => {});
        setPending(false);
      });
    },
    [isAuthenticated, startTransition]
  );

  const t = useCallback(
    (key: TranslationKey) => {
      const dict = DICTIONARIES[locale] ?? DICTIONARIES.fr;
      const value = readByPath(dict, key.split("."));
      if (typeof value === "string") return value;
      const fallback = readByPath(DICTIONARIES.fr, key.split("."));
      return typeof fallback === "string" ? fallback : key;
    },
    [locale]
  );

  const value = useMemo(
    () => ({ locale, dir: getLocaleMeta(locale).dir, t, setLocale, pending }),
    [locale, t, setLocale, pending]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}
