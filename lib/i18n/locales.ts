// Registry of every UI language HouseZone's architecture supports. This is
// static metadata (native name, flag, reading direction) that doesn't belong
// in the database — whether a language is actually selectable by users lives
// in the `languages` table (see supabase/migrations/0001_init.sql), which the
// admin "Langues" screen toggles. A code can exist here without being active
// in the DB yet: that's exactly how a language gets "prepared" ahead of being
// switched on (cahier des charges section 2).
export const LOCALES = [
  { code: "fr", nativeName: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "en", nativeName: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "es", nativeName: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "pt", nativeName: "Português", flag: "🇵🇹", dir: "ltr" },
  { code: "ar", nativeName: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "it", nativeName: "Italiano", flag: "🇮🇹", dir: "ltr" },
  { code: "ru", nativeName: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "zh", nativeName: "中文", flag: "🇨🇳", dir: "ltr" },
  { code: "ja", nativeName: "日本語", flag: "🇯🇵", dir: "ltr" },
  { code: "hi", nativeName: "हिन्दी", flag: "🇮🇳", dir: "ltr" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "fr";

export function getLocaleMeta(code: string) {
  return LOCALES.find((l) => l.code === code) ?? LOCALES.find((l) => l.code === DEFAULT_LOCALE)!;
}

export function isLocaleCode(code: string): code is LocaleCode {
  return LOCALES.some((l) => l.code === code);
}
