import type { HostType, ListingStatus, VisitStatus, SubscriptionStatus, ReportStatus } from "@/lib/types/database";

export const APP_NAME = "HouseZone";
export const APP_TAGLINE = "Trouvez votre prochain bien.";

export const HOST_TYPE_LABELS: Record<HostType, string> = {
  proprietaire: "Propriétaire",
  agence: "Agence immobilière",
  demarcheur: "Démarcheur",
  gestionnaire: "Gestionnaire de résidence / meublé",
};

export const HOST_TYPE_DESCRIPTIONS: Record<HostType, string> = {
  proprietaire: "Vous possédez un ou plusieurs biens à louer ou vendre.",
  agence: "Vous représentez une agence immobilière enregistrée.",
  demarcheur: "Vous mettez en relation vendeurs/bailleurs et clients (18 ans minimum).",
  gestionnaire: "Vous gérez une résidence ou des appartements meublés.",
};

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  brouillon: "Brouillon",
  en_attente: "En attente de validation",
  active: "Active",
  refusee: "Refusée",
  bloquee: "Bloquée",
  expiree: "Expirée",
  indisponible: "Indisponible",
  louee: "Louée",
  vendue: "Vendue",
};

export const LISTING_STATUS_COLORS: Record<ListingStatus, string> = {
  brouillon: "bg-zinc-100 text-zinc-600",
  en_attente: "bg-amber-100 text-amber-700",
  active: "bg-emerald-100 text-emerald-700",
  refusee: "bg-red-100 text-red-700",
  bloquee: "bg-red-100 text-red-700",
  expiree: "bg-zinc-100 text-zinc-500",
  indisponible: "bg-zinc-100 text-zinc-600",
  louee: "bg-blue-100 text-blue-700",
  vendue: "bg-blue-100 text-blue-700",
};

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  en_attente: "En attente",
  acceptee: "Acceptée",
  reprogrammation_proposee: "Reprogrammation proposée",
  refusee: "Refusée",
  annulee: "Annulée",
  terminee: "Terminée",
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  essai: "Essai gratuit",
  actif: "Actif",
  expire: "Expiré",
  suspendu: "Suspendu",
  annule: "Annulé",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  nouveau: "Nouveau",
  en_analyse: "En analyse",
  traite: "Traité",
  rejete: "Rejeté",
  action_effectuee: "Action effectuée",
};

export const REPORT_REASONS = [
  "Arnaque",
  "Faux bien",
  "Faux propriétaire",
  "Faux professionnel",
  "Information mensongère",
  "Comportement suspect",
  "Harcèlement",
  "Tentative de contournement",
  "Contenu interdit",
] as const;

export const TRIAL_DURATION_DAYS = 3;

export const EXPIRY_REMINDER_DAYS = [7, 3, 1, 0];

export const QUICK_CATEGORIES = [
  { slug: "villa", label: "Villas" },
  { slug: "appartement", label: "Appartements" },
  { slug: "residence-meublee", label: "Meublés" },
  { slug: "duplex", label: "Duplex" },
  { slug: "terrain", label: "Terrains" },
  { slug: "studio", label: "Studios" },
] as const;

export const NAV_CLIENT = [
  { href: "/", label: "Accueil" },
  { href: "/recherche", label: "Recherche" },
  { href: "/avis-de-recherche", label: "Avis de recherche" },
  { href: "/favoris", label: "Favoris" },
  { href: "/profil", label: "Profil" },
] as const;

export const NAV_HOST = [
  { href: "/espace-hote", label: "Dashboard" },
  { href: "/espace-hote/annonces", label: "Annonces" },
  { href: "/espace-hote/avis-de-recherche", label: "Avis de recherche" },
  { href: "/espace-hote/messages", label: "Messages" },
  { href: "/espace-hote/profil", label: "Profil" },
] as const;
