import Link from "next/link";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Building2,
  CheckCircle2,
  Ban,
  Receipt,
  CalendarX,
  Wallet,
  Clock,
  FileCheck,
  UserX,
  Flag,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/admin/stat-card";
import { MiniTrendChart } from "@/components/admin/mini-trend-chart";
import { relativeTime } from "@/lib/utils";
import { HOST_TYPE_LABELS } from "@/lib/constants";

export const metadata = { title: "Dashboard admin" };

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = await createClient();

  const now = new Date();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const startOfTrendWindow = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();

  const [
    { count: totalUsers },
    { count: totalHosts },
    { count: newSignups },
    { count: totalListings },
    { count: activeListings },
    { count: blockedListings },
    { count: activeSubscriptions },
    { count: expiredSubscriptions },
    { data: monthlyPayments },
    { data: lastMonthPayments },
    { count: pendingHostRequests },
    { count: totalVerificationRequests },
    { count: suspendedUsers },
    { count: bannedUsers },
    { count: openReports },
    { count: pendingPaymentRequests },
    { data: recentHostRequests },
    { data: recentReports },
    { data: listingsHistory },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "host"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", startOfWeek),
    supabase.from("listings").select("id", { count: "exact", head: true }),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "bloquee"),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "actif"),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "expire"),
    supabase.from("payments").select("amount").eq("status", "reussi").gte("created_at", startOfMonth),
    supabase
      .from("payments")
      .select("amount")
      .eq("status", "reussi")
      .gte("created_at", startOfLastMonth)
      .lt("created_at", startOfMonth),
    supabase.from("host_profiles").select("id", { count: "exact", head: true }).eq("verification_status", "en_cours"),
    supabase.from("host_profiles").select("id", { count: "exact", head: true }).neq("verification_status", "non_demande"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "suspended"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "banned"),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "nouveau"),
    supabase.from("subscription_payment_requests").select("id", { count: "exact", head: true }).eq("status", "PENDING"),
    supabase
      .from("host_profiles")
      .select("id, host_type, submitted_at, profiles!host_profiles_user_id_fkey ( first_name, last_name )")
      .eq("verification_status", "en_cours")
      .order("submitted_at", { ascending: false })
      .limit(5),
    supabase
      .from("reports")
      .select("id, reason, created_at, profiles!reports_author_id_fkey ( first_name, last_name )")
      .eq("status", "nouveau")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("listings").select("created_at").gte("created_at", startOfTrendWindow),
  ]);

  const paymentsCount = monthlyPayments?.length ?? 0;
  const paymentsSum = (monthlyPayments ?? []).reduce((acc, p) => acc + (p.amount ?? 0), 0);
  const lastMonthPaymentsSum = (lastMonthPayments ?? []).reduce((acc, p) => acc + (p.amount ?? 0), 0);
  const revenueTrend =
    lastMonthPaymentsSum === 0
      ? null
      : Math.round(((paymentsSum - lastMonthPaymentsSum) / lastMonthPaymentsSum) * 100);

  const trendMonths = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return {
      label: d.toLocaleDateString("fr-FR", { month: "short" }),
      key: `${d.getFullYear()}-${d.getMonth()}`,
      value: 0,
    };
  });
  for (const row of (listingsHistory as { created_at: string }[] | null) ?? []) {
    const d = new Date(row.created_at);
    const bucket = trendMonths.find((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (bucket) bucket.value += 1;
  }

  type HostRequestRow = {
    id: string;
    host_type: string;
    submitted_at: string | null;
    profiles: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
  };
  type ReportRow = {
    id: string;
    reason: string;
    created_at: string;
    profiles: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
  };

  function personName(p: HostRequestRow["profiles"]) {
    const row = Array.isArray(p) ? p[0] : p;
    return row ? `${row.first_name} ${row.last_name}` : "—";
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Tableau de bord</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Utilisateurs" value={totalUsers ?? 0} icon={Users} />
        <StatCard label="Hôtes" value={totalHosts ?? 0} icon={ShieldCheck} />
        <StatCard label="Nouveaux (7j)" value={newSignups ?? 0} icon={UserPlus} />
        <StatCard label="Annonces (total)" value={totalListings ?? 0} icon={Building2} />
        <StatCard label="Annonces actives" value={activeListings ?? 0} icon={CheckCircle2} />
        <StatCard label="Annonces bloquées" value={blockedListings ?? 0} icon={Ban} />
        <StatCard label="Abonnements actifs" value={activeSubscriptions ?? 0} icon={Receipt} />
        <StatCard label="Abonnements expirés" value={expiredSubscriptions ?? 0} icon={CalendarX} />
        <StatCard
          label="Paiements (ce mois)"
          value={paymentsCount}
          icon={Wallet}
          trend={revenueTrend}
          hint={`${new Intl.NumberFormat("fr-FR").format(paymentsSum)} FCFA`}
        />
        <StatCard label="Demandes Hôte en attente" value={pendingHostRequests ?? 0} icon={Clock} />
        <StatCard label="Demandes de vérification (total)" value={totalVerificationRequests ?? 0} icon={FileCheck} />
        <StatCard label="Comptes suspendus" value={suspendedUsers ?? 0} icon={UserX} />
        <StatCard label="Comptes bannis" value={bannedUsers ?? 0} icon={Ban} />
        <StatCard label="Signalements ouverts" value={openReports ?? 0} icon={Flag} />
        <Link href="/admin/abonnements/demandes">
          <StatCard
            label="Demandes de paiement"
            value={pendingPaymentRequests ?? 0}
            icon={Wallet}
            hint="En attente de vérification"
          />
        </Link>
      </div>

      <div className="mt-8 rounded-card border border-hz-navy/10 bg-white p-5">
        <h2 className="font-semibold text-hz-navy">Évolution des annonces</h2>
        <p className="mt-0.5 text-xs text-hz-ink/50">Annonces créées sur les 6 derniers mois</p>
        <MiniTrendChart className="mt-4" points={trendMonths.map((m) => ({ label: m.label, value: m.value }))} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-card border border-hz-navy/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-hz-navy">Dernières demandes Hôte</h2>
            <Link href="/admin/hotes?statut=en_cours" className="text-sm font-medium text-hz-blue hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="mt-3 divide-y divide-hz-navy/10">
            {(recentHostRequests ?? []).length === 0 && (
              <p className="py-4 text-sm text-hz-ink/50">Aucune demande en attente.</p>
            )}
            {(recentHostRequests as HostRequestRow[] | null ?? []).map((r) => (
              <Link
                key={r.id}
                href={`/admin/hotes/${r.id}`}
                className="flex items-center justify-between py-3 text-sm hover:bg-hz-sky/40"
              >
                <div>
                  <p className="font-medium text-hz-navy">{personName(r.profiles)}</p>
                  <p className="text-xs text-hz-ink/50">
                    {HOST_TYPE_LABELS[r.host_type as keyof typeof HOST_TYPE_LABELS] ?? r.host_type}
                  </p>
                </div>
                <span className="text-xs text-hz-ink/50">{r.submitted_at ? relativeTime(r.submitted_at) : ""}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-card border border-hz-navy/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-hz-navy">Derniers signalements</h2>
            <Link href="/admin/signalements?statut=nouveau" className="text-sm font-medium text-hz-blue hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="mt-3 divide-y divide-hz-navy/10">
            {(recentReports ?? []).length === 0 && (
              <p className="py-4 text-sm text-hz-ink/50">Aucun signalement en attente.</p>
            )}
            {(recentReports as ReportRow[] | null ?? []).map((r) => (
              <Link
                key={r.id}
                href="/admin/signalements?statut=nouveau"
                className="flex items-center justify-between py-3 text-sm hover:bg-hz-sky/40"
              >
                <div>
                  <p className="font-medium text-hz-navy">{personName(r.profiles)}</p>
                  <p className="text-xs text-hz-ink/50">{r.reason}</p>
                </div>
                <span className="text-xs text-hz-ink/50">{relativeTime(r.created_at)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
