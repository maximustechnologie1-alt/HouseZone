import { createBrowserClient } from "@supabase/ssr";

// Untyped on purpose — see lib/supabase/server.ts for why.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
