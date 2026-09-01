import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Language } from "@/lib/types/database";

// Cached per-request: both (site)/layout.tsx and site-header.tsx need the
// full roster (active + prepared-but-inactive) for the language selector.
export const getLanguages = cache(async (): Promise<Language[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("languages").select("*");
  return data ?? [];
});
