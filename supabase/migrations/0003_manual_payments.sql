-- ============================================================================
-- HOUSEZONE — ABONNEMENTS : PAIEMENT MANUEL MOBILE MONEY
-- Orange Money / Moov Africa / Wave, configurables depuis l'administration,
-- avec demandes de paiement traçables (preuve, snapshot, validation admin).
-- ============================================================================

create type payment_method_type as enum ('ORANGE_MONEY', 'MOOV_AFRICA', 'WAVE');
create type payment_request_status as enum ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- ============================================================================
-- PAYMENT_METHODS — coordonnées de réception configurées par l'administration.
-- Aucune valeur réelle n'est fournie ici : les numéros sont saisis depuis
-- /admin/parametres/paiements après installation.
-- ============================================================================

create table payment_methods (
  id uuid primary key default gen_random_uuid(),
  method payment_method_type not null unique,
  display_name text not null,
  account_name text not null default '',
  account_number text not null default '',
  payment_reference text not null default '',
  payment_instructions text not null default '',
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles (id)
);

insert into payment_methods (method, display_name) values
  ('ORANGE_MONEY', 'Orange Money'),
  ('MOOV_AFRICA', 'Moov Africa'),
  ('WAVE', 'Wave');

create trigger set_payment_methods_updated_at before update on payment_methods
  for each row execute function set_updated_at();

-- ============================================================================
-- SUBSCRIPTION_PAYMENT_REQUESTS — demande de paiement manuel pour un
-- abonnement Hôte, avec preuve de transfert et snapshot des coordonnées de
-- paiement utilisées (pour rester exactes même si l'admin change son numéro
-- plus tard).
-- ============================================================================

create table subscription_payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  host_type host_type not null,
  subscription_plan_id uuid references subscription_plans (id),
  plan_name text not null,
  duration_months int not null,
  amount numeric(14, 2) not null,
  payment_mode text not null default 'MANUAL',
  payment_method payment_method_type not null,
  payer_phone text not null,
  payment_proof_path text not null,
  comment text,
  status payment_request_status not null default 'PENDING',
  -- Snapshot des coordonnées de paiement au moment de la demande.
  payment_account_name text not null,
  payment_account_number text not null,
  payment_reference text not null,
  reviewed_by uuid references profiles (id),
  reviewed_at timestamptz,
  rejection_reason text,
  subscription_id uuid references subscriptions (id),
  subscription_start timestamptz,
  subscription_end timestamptz,
  created_at timestamptz not null default now()
);

create index subscription_payment_requests_user_idx on subscription_payment_requests (user_id);
create index subscription_payment_requests_status_idx on subscription_payment_requests (status);

-- ============================================================================
-- STORAGE — preuves de paiement (bucket privé, comme verification-docs)
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

create policy "payment_proofs_owner_read" on storage.objects for select
  using (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "payment_proofs_admin_read" on storage.objects for select
  using (bucket_id = 'payment-proofs' and is_admin(auth.uid()));

create policy "payment_proofs_owner_write" on storage.objects for insert
  with check (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table payment_methods enable row level security;
alter table subscription_payment_requests enable row level security;

-- PAYMENT_METHODS : tout utilisateur authentifié voit uniquement les moyens
-- actifs (nécessaire pour l'étape de choix du moyen de paiement) ; l'admin
-- voit et gère tout.
create policy "payment_methods_active_read" on payment_methods for select
  using (is_active = true or is_admin(auth.uid()));

create policy "payment_methods_admin_write" on payment_methods for all
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- SUBSCRIPTION_PAYMENT_REQUESTS : un utilisateur ne voit et ne crée que ses
-- propres demandes ; seul un admin peut les faire évoluer (approuver/refuser)
-- — aucune policy UPDATE n'est accordée à l'utilisateur normal, toute
-- annulation passe par une Server Action utilisant le client service-role
-- après vérification côté serveur (voir lib/actions/subscription-payments.ts).
create policy "spr_owner_or_admin_read" on subscription_payment_requests for select
  using (user_id = auth.uid() or is_admin(auth.uid()));

create policy "spr_owner_insert" on subscription_payment_requests for insert
  with check (user_id = auth.uid() and status = 'PENDING');

create policy "spr_admin_update" on subscription_payment_requests for update
  using (is_admin(auth.uid()));

-- ============================================================================
-- Correction tarif Démarcheur 3 mois (5 900 FCFA au lieu de 5 999 FCFA)
-- ============================================================================

update subscription_plans
set price = 5900
where host_type = 'demarcheur' and duration_months = 3;
