// Types écrits à la main, reflétant supabase/migrations/0001_init.sql.
// Remplaçables plus tard par `supabase gen types typescript` une fois le
// projet connecté (voir supabase/README.md).

export type UserRole = "client" | "host" | "admin";
export type UserStatus = "active" | "suspended" | "banned";
export type HostType = "proprietaire" | "agence" | "demarcheur" | "gestionnaire";
export type VerificationStatus = "non_demande" | "en_cours" | "accepte" | "refuse";
export type OperationType = "location" | "vente" | "reservation";
export type ListingStatus =
  | "brouillon"
  | "en_attente"
  | "active"
  | "refusee"
  | "bloquee"
  | "expiree"
  | "indisponible"
  | "louee"
  | "vendue";
export type VisitStatus =
  | "en_attente"
  | "acceptee"
  | "reprogrammation_proposee"
  | "refusee"
  | "annulee"
  | "terminee";
export type SearchAlertStatus = "active" | "fermee" | "bloquee";
export type SubscriptionStatus = "essai" | "actif" | "expire" | "suspendu" | "annule";
export type PaymentMethod = "mobile_money" | "carte";
export type PaymentStatus = "initie" | "en_attente" | "reussi" | "echoue" | "annule" | "rembourse";
export type BookingStatus = "en_attente" | "confirmee" | "annulee" | "terminee";
export type ReportTargetType = "listing" | "user" | "message" | "search_alert";
export type ReportStatus = "nouveau" | "en_analyse" | "traite" | "rejete" | "action_effectuee";
export type SanctionType = "avertissement" | "limitation" | "suspension" | "bannissement";
export type RiskLevel = "faible" | "a_surveiller" | "risque" | "critique";
export type NotificationType =
  | "nouveau_message"
  | "visite_acceptee"
  | "visite_reprogrammee"
  | "visite_refusee"
  | "visite_demande"
  | "nouveau_favori"
  | "annonce_approuvee"
  | "annonce_refusee"
  | "annonce_bloquee"
  | "paiement_confirme"
  | "abonnement_expire_bientot"
  | "signalement_important"
  | "nouvelle_demande_hote"
  | "annonce_suspecte"
  | "alerte_correspondante"
  | "systeme";

export interface Profile {
  id: string;
  role: UserRole;
  status: UserStatus;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  language: string;
  push_enabled: boolean;
  risk_level: RiskLevel;
  created_at: string;
  updated_at: string;
}

export interface HostProfile {
  id: string;
  user_id: string;
  host_type: HostType;
  company_name: string | null;
  legal_form: string | null;
  registration_number: string | null;
  age: number | null;
  bio: string | null;
  verification_status: VerificationStatus;
  verification_reason: string | null;
  badge_verified: boolean;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerificationDocument {
  id: string;
  host_profile_id: string;
  doc_type: string;
  storage_path: string;
  status: VerificationStatus;
  uploaded_at: string;
}

export interface City {
  id: string;
  name: string;
  active: boolean;
}

export interface Neighborhood {
  id: string;
  city_id: string;
  name: string;
  active: boolean;
}

export interface PropertyCategory {
  id: string;
  slug: string;
  name: string;
  family: "maison" | "appartement" | "terrain";
  active: boolean;
  sort_order: number;
}

export interface Language {
  code: string;
  name: string;
  active: boolean;
}

export interface ListingFeatures {
  piscine?: boolean;
  climatisation?: boolean;
  gardien?: boolean;
  parking?: boolean;
  terrasse?: boolean;
  jardin?: boolean;
  groupe_electrogene?: boolean;
  forage?: boolean;
  cloture?: boolean;
  internet?: boolean;
}

export interface Listing {
  id: string;
  host_id: string;
  category_id: string;
  city_id: string;
  neighborhood_id: string | null;
  title: string;
  description: string;
  operation_type: OperationType;
  price: number;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  surface_m2: number | null;
  furnished: boolean;
  features: ListingFeatures;
  status: ListingStatus;
  rejection_reason: string | null;
  views_count: number;
  favorites_count: number;
  boosted_until: string | null;
  moderation_flag: boolean;
  moderation_notes: string | null;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  storage_path: string;
  position: number;
  ocr_status: "en_attente" | "valide" | "refuse";
  ocr_flagged_text: string | null;
  is_flagged: boolean;
  created_at: string;
}

export interface Favorite {
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface VisitRequest {
  id: string;
  listing_id: string;
  client_id: string;
  host_id: string;
  requested_date: string;
  requested_time: string;
  message: string | null;
  status: VisitStatus;
  proposed_date: string | null;
  proposed_time: string | null;
  host_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface SearchAlert {
  id: string;
  client_id: string;
  category_id: string | null;
  city_id: string | null;
  neighborhood_id: string | null;
  budget_min: number | null;
  budget_max: number | null;
  characteristics: string | null;
  description: string | null;
  status: SearchAlertStatus;
  moderation_flag: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string | null;
  client_id: string;
  host_id: string;
  last_message_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  original_content: string | null;
  is_blocked: boolean;
  blocked_reason: string | null;
  read_at: string | null;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  host_type: HostType;
  name: string;
  duration_months: number;
  price: number;
  active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  host_id: string;
  plan_id: string | null;
  host_type: HostType;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  booking_id: string | null;
  amount: number;
  method: PaymentMethod;
  provider_reference: string | null;
  status: PaymentStatus;
  failure_reason: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
}

export interface Receipt {
  id: string;
  payment_id: string;
  receipt_number: string;
  generated_at: string;
}

export interface Booking {
  id: string;
  listing_id: string;
  client_id: string;
  host_id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: BookingStatus;
  payment_id: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  keys: Record<string, string>;
  created_at: string;
}

export interface Report {
  id: string;
  author_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  comment: string | null;
  status: ReportStatus;
  handled_by: string | null;
  handled_at: string | null;
  resolution_notes: string | null;
  created_at: string;
}

export interface Sanction {
  id: string;
  user_id: string;
  type: SanctionType;
  reason: string;
  issued_by: string;
  issued_at: string;
  expires_at: string | null;
}

export interface AuditLog {
  id: string;
  admin_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  target_user_id: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: never[];
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<Profile>;
      host_profiles: TableDef<HostProfile>;
      verification_documents: TableDef<VerificationDocument>;
      cities: TableDef<City>;
      neighborhoods: TableDef<Neighborhood>;
      property_categories: TableDef<PropertyCategory>;
      languages: TableDef<Language>;
      listings: TableDef<Listing>;
      listing_images: TableDef<ListingImage>;
      favorites: TableDef<Favorite>;
      visit_requests: TableDef<VisitRequest>;
      search_alerts: TableDef<SearchAlert>;
      conversations: TableDef<Conversation>;
      messages: TableDef<Message>;
      subscription_plans: TableDef<SubscriptionPlan>;
      subscriptions: TableDef<Subscription>;
      payments: TableDef<Payment>;
      receipts: TableDef<Receipt>;
      bookings: TableDef<Booking>;
      notifications: TableDef<Notification>;
      push_subscriptions: TableDef<PushSubscriptionRow>;
      reports: TableDef<Report>;
      sanctions: TableDef<Sanction>;
      audit_logs: TableDef<AuditLog>;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: { uid: string }; Returns: boolean };
      is_host_with_active_access: { Args: { uid: string }; Returns: boolean };
      increment_listing_views: { Args: { listing_id: string }; Returns: undefined };
    };
  };
}
