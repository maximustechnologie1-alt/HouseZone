-- ============================================================================
-- HOUSEZONE — SCHEMA INITIAL
-- Plateforme immobilière (Client / Hôte / Admin) — Burkina Faso
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

create type user_role as enum ('client', 'host', 'admin');
create type user_status as enum ('active', 'suspended', 'banned');
create type host_type as enum ('proprietaire', 'agence', 'demarcheur', 'gestionnaire');
create type verification_status as enum ('non_demande', 'en_cours', 'accepte', 'refuse');
create type operation_type as enum ('location', 'vente', 'reservation');
create type listing_status as enum (
  'brouillon', 'en_attente', 'active', 'refusee', 'bloquee',
  'expiree', 'indisponible', 'louee', 'vendue'
);
create type visit_status as enum (
  'en_attente', 'acceptee', 'reprogrammation_proposee', 'refusee', 'annulee', 'terminee'
);
create type search_alert_status as enum ('active', 'fermee', 'bloquee');
create type subscription_status as enum ('essai', 'actif', 'expire', 'suspendu', 'annule');
create type payment_method as enum ('mobile_money', 'carte');
create type payment_status as enum ('initie', 'en_attente', 'reussi', 'echoue', 'annule', 'rembourse');
create type booking_status as enum ('en_attente', 'confirmee', 'annulee', 'terminee');
create type report_target_type as enum ('listing', 'user', 'message', 'search_alert');
create type report_status as enum ('nouveau', 'en_analyse', 'traite', 'rejete', 'action_effectuee');
create type sanction_type as enum ('avertissement', 'limitation', 'suspension', 'bannissement');
create type risk_level as enum ('faible', 'a_surveiller', 'risque', 'critique');
create type notification_type as enum (
  'nouveau_message', 'visite_acceptee', 'visite_reprogrammee', 'visite_refusee',
  'visite_demande', 'nouveau_favori', 'annonce_approuvee', 'annonce_refusee',
  'annonce_bloquee', 'paiement_confirme', 'abonnement_expire_bientot',
  'signalement_important', 'nouvelle_demande_hote', 'annonce_suspecte',
  'alerte_correspondante', 'systeme'
);

-- ============================================================================
-- PROFILES (extends auth.users)
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'client',
  status user_status not null default 'active',
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  email text,
  avatar_url text,
  language text not null default 'fr',
  push_enabled boolean not null default false,
  risk_level risk_level not null default 'faible',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on profiles (role);
create index profiles_status_idx on profiles (status);

-- ============================================================================
-- HOST PROFILES
-- ============================================================================

create table host_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles (id) on delete cascade,
  host_type host_type not null,
  company_name text,
  legal_form text,
  registration_number text,
  age int,
  bio text,
  verification_status verification_status not null default 'non_demande',
  verification_reason text,
  badge_verified boolean not null default false,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index host_profiles_status_idx on host_profiles (verification_status);

create table verification_documents (
  id uuid primary key default gen_random_uuid(),
  host_profile_id uuid not null references host_profiles (id) on delete cascade,
  doc_type text not null, -- cni, passeport, carte_consulaire, rccm, autre
  storage_path text not null, -- private bucket path
  status verification_status not null default 'en_cours',
  uploaded_at timestamptz not null default now()
);

-- ============================================================================
-- GEOGRAPHY & CATEGORIES (admin-editable taxonomies)
-- ============================================================================

create table cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true
);

create table neighborhoods (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities (id) on delete cascade,
  name text not null,
  active boolean not null default true,
  unique (city_id, name)
);

create table property_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  family text not null, -- maison, appartement, terrain
  active boolean not null default true,
  sort_order int not null default 0
);

create table languages (
  code text primary key,
  name text not null,
  active boolean not null default true
);

insert into languages (code, name, active) values
  ('fr', 'Français', true),
  ('en', 'English', false),
  ('es', 'Español', false),
  ('pt', 'Português', false),
  ('ar', 'العربية', false);

insert into property_categories (slug, name, family, sort_order) values
  ('studio', 'Studio', 'maison', 1),
  ('chambre-salon', 'Chambre-salon', 'maison', 2),
  ('mini-villa', 'Mini-villa', 'maison', 3),
  ('villa', 'Villa', 'maison', 4),
  ('duplex', 'Duplex', 'maison', 5),
  ('appartement', 'Appartement', 'appartement', 6),
  ('appartement-meuble', 'Appartement meublé', 'appartement', 7),
  ('residence', 'Résidence', 'appartement', 8),
  ('residence-meublee', 'Résidence meublée', 'appartement', 9),
  ('terrain', 'Terrain à vendre', 'terrain', 10);

insert into cities (name) values ('Ouagadougou'), ('Bobo-Dioulasso'), ('Koudougou'), ('Ouahigouya');

-- ============================================================================
-- LISTINGS
-- ============================================================================

create table listings (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references profiles (id) on delete cascade,
  category_id uuid not null references property_categories (id),
  city_id uuid not null references cities (id),
  neighborhood_id uuid references neighborhoods (id),
  title text not null,
  description text not null default '',
  operation_type operation_type not null,
  price numeric(14, 2) not null,
  address text,
  latitude double precision,
  longitude double precision,
  bedrooms int,
  bathrooms int,
  surface_m2 numeric(10, 2),
  furnished boolean not null default false,
  features jsonb not null default '{}'::jsonb, -- piscine, terrasse, gardien, clim, etc.
  status listing_status not null default 'brouillon',
  rejection_reason text,
  views_count int not null default 0,
  favorites_count int not null default 0,
  boosted_until timestamptz,
  moderation_flag boolean not null default false,
  moderation_notes text,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_host_idx on listings (host_id);
create index listings_status_idx on listings (status);
create index listings_city_idx on listings (city_id);
create index listings_category_idx on listings (category_id);
create index listings_operation_idx on listings (operation_type);
create index listings_price_idx on listings (price);

create table listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  storage_path text not null,
  position int not null default 0,
  ocr_status text not null default 'en_attente', -- en_attente, valide, refuse
  ocr_flagged_text text,
  is_flagged boolean not null default false,
  created_at timestamptz not null default now()
);

create index listing_images_listing_idx on listing_images (listing_id);

-- ============================================================================
-- FAVORITES
-- ============================================================================

create table favorites (
  user_id uuid not null references profiles (id) on delete cascade,
  listing_id uuid not null references listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- ============================================================================
-- VISIT REQUESTS
-- ============================================================================

create table visit_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  client_id uuid not null references profiles (id) on delete cascade,
  host_id uuid not null references profiles (id) on delete cascade,
  requested_date date not null,
  requested_time time not null,
  message text,
  status visit_status not null default 'en_attente',
  proposed_date date,
  proposed_time time,
  host_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index visit_requests_client_idx on visit_requests (client_id);
create index visit_requests_host_idx on visit_requests (host_id);
create index visit_requests_listing_idx on visit_requests (listing_id);

-- ============================================================================
-- SEARCH ALERTS (avis de recherche)
-- ============================================================================

create table search_alerts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  category_id uuid references property_categories (id),
  city_id uuid references cities (id),
  neighborhood_id uuid references neighborhoods (id),
  budget_min numeric(14, 2),
  budget_max numeric(14, 2),
  characteristics text,
  description text,
  status search_alert_status not null default 'active',
  moderation_flag boolean not null default false,
  created_at timestamptz not null default now()
);

create index search_alerts_client_idx on search_alerts (client_id);
create index search_alerts_status_idx on search_alerts (status);

-- ============================================================================
-- MESSAGING
-- ============================================================================

create table conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings (id) on delete set null,
  client_id uuid not null references profiles (id) on delete cascade,
  host_id uuid not null references profiles (id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (listing_id, client_id, host_id)
);

create index conversations_client_idx on conversations (client_id);
create index conversations_host_idx on conversations (host_id);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  sender_id uuid not null references profiles (id) on delete cascade,
  content text not null,
  original_content text,
  is_blocked boolean not null default false,
  blocked_reason text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index messages_conversation_idx on messages (conversation_id);

-- ============================================================================
-- SUBSCRIPTIONS & PLANS
-- ============================================================================

create table subscription_plans (
  id uuid primary key default gen_random_uuid(),
  host_type host_type not null,
  name text not null,
  duration_months int not null,
  price numeric(14, 2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into subscription_plans (host_type, name, duration_months, price) values
  ('proprietaire', 'Propriétaire — 1 mois', 1, 9000),
  ('proprietaire', 'Propriétaire — 3 mois', 3, 14999),
  ('agence', 'Agence immobilière — 1 mois', 1, 14999),
  ('agence', 'Agence immobilière — 3 mois', 3, 29999),
  ('demarcheur', 'Démarcheur — 1 mois', 1, 3000),
  ('demarcheur', 'Démarcheur — 3 mois', 3, 5999),
  ('gestionnaire', 'Gestionnaire — 1 mois', 1, 6999),
  ('gestionnaire', 'Gestionnaire — 3 mois', 3, 10999);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references profiles (id) on delete cascade,
  plan_id uuid references subscription_plans (id),
  host_type host_type not null,
  status subscription_status not null default 'essai',
  start_date timestamptz not null default now(),
  end_date timestamptz not null,
  auto_renew boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_host_idx on subscriptions (host_id);
create index subscriptions_status_idx on subscriptions (status);

-- ============================================================================
-- PAYMENTS & RECEIPTS
-- ============================================================================

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  subscription_id uuid references subscriptions (id) on delete set null,
  booking_id uuid,
  amount numeric(14, 2) not null,
  method payment_method not null,
  provider_reference text,
  status payment_status not null default 'initie',
  failure_reason text,
  confirmed_by uuid references profiles (id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create index payments_user_idx on payments (user_id);
create index payments_status_idx on payments (status);

create table receipts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null unique references payments (id) on delete cascade,
  receipt_number text not null unique,
  generated_at timestamptz not null default now()
);

-- ============================================================================
-- BOOKINGS (réservation logements meublés)
-- ============================================================================

create table bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  client_id uuid not null references profiles (id) on delete cascade,
  host_id uuid not null references profiles (id) on delete cascade,
  check_in date not null,
  check_out date not null,
  total_price numeric(14, 2) not null,
  status booking_status not null default 'en_attente',
  payment_id uuid references payments (id),
  created_at timestamptz not null default now()
);

create index bookings_listing_idx on bookings (listing_id);
create index bookings_client_idx on bookings (client_id);

alter table payments
  add constraint payments_booking_fk foreign key (booking_id) references bookings (id) on delete set null;

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on notifications (user_id, is_read);

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  endpoint text not null unique,
  keys jsonb not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- REPORTS, SANCTIONS, AUDIT
-- ============================================================================

create table reports (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles (id) on delete cascade,
  target_type report_target_type not null,
  target_id uuid not null,
  reason text not null,
  comment text,
  status report_status not null default 'nouveau',
  handled_by uuid references profiles (id),
  handled_at timestamptz,
  resolution_notes text,
  created_at timestamptz not null default now()
);

create index reports_status_idx on reports (status);
create index reports_target_idx on reports (target_type, target_id);

create table sanctions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  type sanction_type not null,
  reason text not null,
  issued_by uuid not null references profiles (id),
  issued_at timestamptz not null default now(),
  expires_at timestamptz
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references profiles (id),
  action text not null,
  target_type text not null,
  target_id text,
  target_user_id uuid references profiles (id),
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_admin_idx on audit_logs (admin_id);
create index audit_logs_created_idx on audit_logs (created_at desc);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

create or replace function is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = uid and role = 'admin');
$$;

create or replace function is_host_with_active_access(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from subscriptions
    where host_id = uid
      and status in ('essai', 'actif')
      and end_date > now()
  );
$$;

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, first_name, last_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger set_host_profiles_updated_at before update on host_profiles
  for each row execute function set_updated_at();
create trigger set_listings_updated_at before update on listings
  for each row execute function set_updated_at();
create trigger set_visit_requests_updated_at before update on visit_requests
  for each row execute function set_updated_at();
create trigger set_subscriptions_updated_at before update on subscriptions
  for each row execute function set_updated_at();

-- keep favorites_count in sync
create or replace function sync_favorites_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update listings set favorites_count = favorites_count + 1 where id = new.listing_id;
  elsif tg_op = 'DELETE' then
    update listings set favorites_count = greatest(favorites_count - 1, 0) where id = old.listing_id;
  end if;
  return null;
end;
$$;

create trigger favorites_count_trigger
  after insert or delete on favorites
  for each row execute function sync_favorites_count();

-- bump conversation last_message_at
create or replace function sync_conversation_last_message()
returns trigger language plpgsql as $$
begin
  update conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;

create trigger conversation_last_message_trigger
  after insert on messages
  for each row execute function sync_conversation_last_message();

create or replace function increment_listing_views(listing_id uuid)
returns void language sql security definer set search_path = public as $$
  update listings set views_count = views_count + 1 where id = listing_id;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table profiles enable row level security;
alter table host_profiles enable row level security;
alter table verification_documents enable row level security;
alter table cities enable row level security;
alter table neighborhoods enable row level security;
alter table property_categories enable row level security;
alter table languages enable row level security;
alter table listings enable row level security;
alter table listing_images enable row level security;
alter table favorites enable row level security;
alter table visit_requests enable row level security;
alter table search_alerts enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table subscription_plans enable row level security;
alter table subscriptions enable row level security;
alter table payments enable row level security;
alter table receipts enable row level security;
alter table bookings enable row level security;
alter table notifications enable row level security;
alter table push_subscriptions enable row level security;
alter table reports enable row level security;
alter table sanctions enable row level security;
alter table audit_logs enable row level security;

-- PROFILES
create policy "profiles_select_own_or_admin" on profiles for select
  using (id = auth.uid() or is_admin(auth.uid()));
create policy "profiles_select_public_host" on profiles for select
  using (role = 'host');
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid() or is_admin(auth.uid()));
create policy "profiles_insert_own" on profiles for insert
  with check (id = auth.uid());

-- HOST PROFILES
create policy "host_profiles_select_own_public_or_admin" on host_profiles for select
  using (user_id = auth.uid() or is_admin(auth.uid()) or verification_status = 'accepte');
create policy "host_profiles_insert_own" on host_profiles for insert
  with check (user_id = auth.uid());
create policy "host_profiles_update_own_or_admin" on host_profiles for update
  using (user_id = auth.uid() or is_admin(auth.uid()));

-- VERIFICATION DOCUMENTS (strictly private)
create policy "verification_documents_owner_or_admin" on verification_documents for select
  using (
    is_admin(auth.uid())
    or exists (select 1 from host_profiles hp where hp.id = host_profile_id and hp.user_id = auth.uid())
  );
create policy "verification_documents_insert_owner" on verification_documents for insert
  with check (exists (select 1 from host_profiles hp where hp.id = host_profile_id and hp.user_id = auth.uid()));
create policy "verification_documents_admin_update" on verification_documents for update
  using (is_admin(auth.uid()));

-- TAXONOMIES (public read, admin write)
create policy "cities_public_read" on cities for select using (true);
create policy "cities_admin_write" on cities for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "neighborhoods_public_read" on neighborhoods for select using (true);
create policy "neighborhoods_admin_write" on neighborhoods for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "categories_public_read" on property_categories for select using (true);
create policy "categories_admin_write" on property_categories for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "languages_public_read" on languages for select using (true);
create policy "languages_admin_write" on languages for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- LISTINGS
create policy "listings_public_read_active" on listings for select
  using (status = 'active' or host_id = auth.uid() or is_admin(auth.uid()));
create policy "listings_host_insert" on listings for insert
  with check (host_id = auth.uid());
create policy "listings_host_or_admin_update" on listings for update
  using (host_id = auth.uid() or is_admin(auth.uid()));
create policy "listings_host_or_admin_delete" on listings for delete
  using (host_id = auth.uid() or is_admin(auth.uid()));

-- LISTING IMAGES
create policy "listing_images_read" on listing_images for select
  using (
    exists (
      select 1 from listings l where l.id = listing_id
      and (l.status = 'active' or l.host_id = auth.uid() or is_admin(auth.uid()))
    )
  );
create policy "listing_images_write" on listing_images for all
  using (
    exists (select 1 from listings l where l.id = listing_id and (l.host_id = auth.uid() or is_admin(auth.uid())))
  )
  with check (
    exists (select 1 from listings l where l.id = listing_id and (l.host_id = auth.uid() or is_admin(auth.uid())))
  );

-- FAVORITES
create policy "favorites_owner" on favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- VISIT REQUESTS
create policy "visit_requests_participants" on visit_requests for select
  using (client_id = auth.uid() or host_id = auth.uid() or is_admin(auth.uid()));
create policy "visit_requests_client_insert" on visit_requests for insert
  with check (client_id = auth.uid());
create policy "visit_requests_participants_update" on visit_requests for update
  using (client_id = auth.uid() or host_id = auth.uid() or is_admin(auth.uid()));

-- SEARCH ALERTS
create policy "search_alerts_author_admin" on search_alerts for select
  using (client_id = auth.uid() or is_admin(auth.uid()));
create policy "search_alerts_host_read_if_active" on search_alerts for select
  using (status = 'active' and is_host_with_active_access(auth.uid()));
create policy "search_alerts_client_insert" on search_alerts for insert
  with check (client_id = auth.uid());
create policy "search_alerts_owner_or_admin_update" on search_alerts for update
  using (client_id = auth.uid() or is_admin(auth.uid()));
create policy "search_alerts_owner_or_admin_delete" on search_alerts for delete
  using (client_id = auth.uid() or is_admin(auth.uid()));

-- CONVERSATIONS
create policy "conversations_participants" on conversations for select
  using (client_id = auth.uid() or host_id = auth.uid() or is_admin(auth.uid()));
create policy "conversations_participants_insert" on conversations for insert
  with check (client_id = auth.uid() or host_id = auth.uid());

-- MESSAGES
create policy "messages_participants_select" on messages for select
  using (
    exists (
      select 1 from conversations c where c.id = conversation_id
      and (c.client_id = auth.uid() or c.host_id = auth.uid() or is_admin(auth.uid()))
    )
  );
create policy "messages_participants_insert" on messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversations c where c.id = conversation_id
      and (c.client_id = auth.uid() or c.host_id = auth.uid())
    )
  );
create policy "messages_participants_update" on messages for update
  using (
    exists (
      select 1 from conversations c where c.id = conversation_id
      and (c.client_id = auth.uid() or c.host_id = auth.uid())
    )
  );

-- SUBSCRIPTION PLANS (public read, admin write)
create policy "subscription_plans_public_read" on subscription_plans for select using (true);
create policy "subscription_plans_admin_write" on subscription_plans for all
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- SUBSCRIPTIONS
create policy "subscriptions_owner_or_admin" on subscriptions for select
  using (host_id = auth.uid() or is_admin(auth.uid()));
create policy "subscriptions_owner_insert" on subscriptions for insert
  with check (host_id = auth.uid() or is_admin(auth.uid()));
create policy "subscriptions_admin_update" on subscriptions for update
  using (is_admin(auth.uid()) or host_id = auth.uid());

-- PAYMENTS
create policy "payments_owner_or_admin" on payments for select
  using (user_id = auth.uid() or is_admin(auth.uid()));
create policy "payments_owner_insert" on payments for insert
  with check (user_id = auth.uid());
create policy "payments_admin_update" on payments for update
  using (is_admin(auth.uid()));

-- RECEIPTS
create policy "receipts_owner_or_admin" on receipts for select
  using (
    is_admin(auth.uid())
    or exists (select 1 from payments p where p.id = payment_id and p.user_id = auth.uid())
  );

-- BOOKINGS
create policy "bookings_participants" on bookings for select
  using (client_id = auth.uid() or host_id = auth.uid() or is_admin(auth.uid()));
create policy "bookings_client_insert" on bookings for insert
  with check (client_id = auth.uid());
create policy "bookings_participants_update" on bookings for update
  using (client_id = auth.uid() or host_id = auth.uid() or is_admin(auth.uid()));

-- NOTIFICATIONS
create policy "notifications_owner" on notifications for select using (user_id = auth.uid());
create policy "notifications_owner_update" on notifications for update using (user_id = auth.uid());
-- Regular inserts always go through lib/actions/notifications.ts's
-- createNotification(), which uses the service-role client and therefore
-- bypasses RLS entirely. This policy only covers direct client access and
-- is intentionally restricted to admins to prevent forged notifications.
create policy "notifications_admin_insert" on notifications for insert with check (is_admin(auth.uid()));

-- PUSH SUBSCRIPTIONS
create policy "push_subscriptions_owner" on push_subscriptions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- REPORTS
create policy "reports_author_or_admin" on reports for select
  using (author_id = auth.uid() or is_admin(auth.uid()));
create policy "reports_author_insert" on reports for insert
  with check (author_id = auth.uid());
create policy "reports_admin_update" on reports for update
  using (is_admin(auth.uid()));

-- SANCTIONS
create policy "sanctions_owner_or_admin" on sanctions for select
  using (user_id = auth.uid() or is_admin(auth.uid()));
create policy "sanctions_admin_write" on sanctions for insert with check (is_admin(auth.uid()));

-- AUDIT LOGS (admin only)
create policy "audit_logs_admin_only" on audit_logs for select using (is_admin(auth.uid()));
create policy "audit_logs_admin_insert" on audit_logs for insert with check (is_admin(auth.uid()));
