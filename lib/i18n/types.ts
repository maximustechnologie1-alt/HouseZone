import type fr from "./dictionaries/fr";

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

// French is authored directly as a literal object (see fr.ts) so its keys
// are the source of truth; every other locale is typed against this shape
// (with leaf string literals widened to `string`, since translations are
// obviously different text), which makes a missing key a compile error
// instead of a silent gap.
export type Dictionary = Widen<typeof fr>;

export type TranslationKey = {
  [N in keyof Dictionary]: `${N & string}.${keyof Dictionary[N] & string}`;
}[keyof Dictionary];
