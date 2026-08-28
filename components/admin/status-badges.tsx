import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SUBSCRIPTION_PAYMENT_REQUEST_STATUS_LABELS,
  SUBSCRIPTION_PAYMENT_REQUEST_STATUS_COLORS,
} from "@/lib/constants";
import type {
  UserStatus,
  VerificationStatus,
  PaymentStatus,
  SearchAlertStatus,
  SanctionType,
  SubscriptionPaymentRequestStatus,
} from "@/lib/types/database";

export function SubscriptionPaymentRequestStatusBadge({ status }: { status: SubscriptionPaymentRequestStatus }) {
  return (
    <Badge className={SUBSCRIPTION_PAYMENT_REQUEST_STATUS_COLORS[status]}>
      {SUBSCRIPTION_PAYMENT_REQUEST_STATUS_LABELS[status]}
    </Badge>
  );
}

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: "Actif",
  suspended: "Suspendu",
  banned: "Banni",
};

const USER_STATUS_COLORS: Record<UserStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  suspended: "bg-amber-100 text-amber-700",
  banned: "bg-red-100 text-red-700",
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <Badge className={USER_STATUS_COLORS[status]}>{USER_STATUS_LABELS[status]}</Badge>;
}

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  non_demande: "Non demandé",
  en_cours: "En cours",
  accepte: "Accepté",
  refuse: "Refusé",
};

const VERIFICATION_STATUS_COLORS: Record<VerificationStatus, string> = {
  non_demande: "bg-zinc-100 text-zinc-600",
  en_cours: "bg-amber-100 text-amber-700",
  accepte: "bg-emerald-100 text-emerald-700",
  refuse: "bg-red-100 text-red-700",
};

export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  return <Badge className={VERIFICATION_STATUS_COLORS[status]}>{VERIFICATION_STATUS_LABELS[status]}</Badge>;
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  initie: "Initié",
  en_attente: "En attente",
  reussi: "Réussi",
  echoue: "Échoué",
  annule: "Annulé",
  rembourse: "Remboursé",
};

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  initie: "bg-zinc-100 text-zinc-600",
  en_attente: "bg-amber-100 text-amber-700",
  reussi: "bg-emerald-100 text-emerald-700",
  echoue: "bg-red-100 text-red-700",
  annule: "bg-zinc-100 text-zinc-500",
  rembourse: "bg-blue-100 text-blue-700",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge className={PAYMENT_STATUS_COLORS[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>;
}

export const SEARCH_ALERT_STATUS_LABELS: Record<SearchAlertStatus, string> = {
  active: "Active",
  fermee: "Fermée",
  bloquee: "Bloquée",
};

const SEARCH_ALERT_STATUS_COLORS: Record<SearchAlertStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  fermee: "bg-zinc-100 text-zinc-600",
  bloquee: "bg-red-100 text-red-700",
};

export function SearchAlertStatusBadge({ status }: { status: SearchAlertStatus }) {
  return <Badge className={SEARCH_ALERT_STATUS_COLORS[status]}>{SEARCH_ALERT_STATUS_LABELS[status]}</Badge>;
}

export const SANCTION_TYPE_LABELS: Record<SanctionType, string> = {
  avertissement: "Avertissement",
  limitation: "Limitation",
  suspension: "Suspension",
  bannissement: "Bannissement",
};

export function GenericBadge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "warning" | "danger" | "success" }) {
  const tones = {
    neutral: "bg-zinc-100 text-zinc-600",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    success: "bg-emerald-100 text-emerald-700",
  };
  return <Badge className={cn(tones[tone])}>{label}</Badge>;
}
