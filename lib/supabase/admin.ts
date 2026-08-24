import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client — bypasses Row Level Security. Server-only, never
// import this from a Client Component or expose the key to the browser.
// Reserved for privileged operations: admin actions, payment confirmation
// webhooks, and reading verification documents across all hosts.
// Untyped generic — see lib/supabase/server.ts.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
