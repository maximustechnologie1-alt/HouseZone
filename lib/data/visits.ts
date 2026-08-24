import { createClient } from "@/lib/supabase/server";
import type { VisitStatus } from "@/lib/types/database";

const SELECT = `
  id, requested_date, requested_time, message, status, proposed_date, proposed_time, host_note, created_at,
  listing:listings ( id, title, price, city_id, cities ( name ) ),
  client:profiles!visit_requests_client_id_fkey ( id, first_name, last_name, phone ),
  host:profiles!visit_requests_host_id_fkey ( id, first_name, last_name, phone )
`;

export interface VisitRow {
  id: string;
  requested_date: string;
  requested_time: string;
  message: string | null;
  status: VisitStatus;
  proposed_date: string | null;
  proposed_time: string | null;
  host_note: string | null;
  created_at: string;
  listing: { id: string; title: string; price: number; city_id: string; cities: { name: string } | null } | null;
  client: { id: string; first_name: string; last_name: string; phone: string | null } | null;
  host: { id: string; first_name: string; last_name: string; phone: string | null } | null;
}

export async function getClientVisits(clientId: string): Promise<VisitRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("visit_requests")
    .select(SELECT)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as VisitRow[];
}

export async function getHostVisits(hostId: string): Promise<VisitRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("visit_requests")
    .select(SELECT)
    .eq("host_id", hostId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as VisitRow[];
}
