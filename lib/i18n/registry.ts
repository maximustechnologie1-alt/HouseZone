import type { LocaleCode } from "./locales";
import type { Dictionary } from "./types";
import fr from "./dictionaries/fr";
import en from "./dictionaries/en";
import es from "./dictionaries/es";
import pt from "./dictionaries/pt";
import ar from "./dictionaries/ar";
import it from "./dictionaries/it";
import ru from "./dictionaries/ru";
import zh from "./dictionaries/zh";
import ja from "./dictionaries/ja";
import hi from "./dictionaries/hi";

// Every dictionary is a small, statically-imported object (not fetched), so
// switching locale is instant client-side — no network round trip, no
// loading state. Adding an 11th language later is one entry here plus a
// dictionary file, nothing structural.
export const DICTIONARIES: Record<LocaleCode, Dictionary> = { fr, en, es, pt, ar, it, ru, zh, ja, hi };
