-- Real bug found during a full cahier-des-charges audit: `profiles` only had
-- "self or admin" and "public host" (role = 'host') select policies. A HOST
-- reading a CLIENT's row (role = 'client') through the
-- conversations_client_id_fkey / visit_requests_client_id_fkey embeds
-- (lib/data/messages.ts, lib/data/visits.ts) was silently RLS-blocked to
-- null — hosts saw no name/phone for the person messaging them or
-- requesting a visit. Add reciprocal visibility for genuine counterparties
-- of an active interaction; app queries already scope the selected columns
-- per context (name-only in conversations, name+phone for visit
-- coordination), so this only restores row *visibility*, not new columns.
create policy "profiles_select_counterparty" on profiles for select
  using (
    exists (
      select 1 from conversations c
      where (c.client_id = auth.uid() and c.host_id = profiles.id)
         or (c.host_id = auth.uid() and c.client_id = profiles.id)
    )
    or exists (
      select 1 from visit_requests v
      where (v.client_id = auth.uid() and v.host_id = profiles.id)
         or (v.host_id = auth.uid() and v.client_id = profiles.id)
    )
  );
