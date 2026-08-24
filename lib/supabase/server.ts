import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server Component / Server Action client — reads and (best-effort) writes
// the Supabase auth cookies for the current request.
//
// Deliberately untyped: the hand-written `Database` type in
// lib/types/database.ts documents each table's shape and is used to type
// query results by hand (see lib/data/*.ts), but the generic PostgREST
// query-builder types are extremely strict about the exact shape of a
// `Database` type and don't degrade gracefully when it's approximate. Once
// this project is connected to a real Supabase project, replace this with
// `supabase gen types typescript` output and re-add `createServerClient<Database>`.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component without a mutable response —
            // the proxy (proxy.ts) refreshes the session on navigation.
          }
        },
      },
    }
  );
}
