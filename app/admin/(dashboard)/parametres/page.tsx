import Link from "next/link";
import { Wallet, ChevronRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/badge";
import { APP_NAME, TRIAL_DURATION_DAYS } from "@/lib/constants";

export const metadata = { title: "Paramètres" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ count: plansCount }, { count: categoriesCount }] = await Promise.all([
    supabase.from("subscription_plans").select("id", { count: "exact", head: true }),
    supabase.from("property_categories").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Paramètres</h1>

      <Link
        href="/admin/parametres/paiements"
        className="mt-6 flex max-w-xl items-center justify-between gap-3 rounded-card border border-hz-navy/10 bg-white p-5 hover:border-hz-blue/30"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-hz-blue/10">
            <Wallet className="h-5 w-5 text-hz-blue" />
          </span>
          <div>
            <p className="font-semibold text-hz-navy">Paiements</p>
            <p className="text-xs text-hz-ink/50">
              Coordonnées Orange Money, Moov Africa, Wave affichées aux Hôtes
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-hz-ink/30" />
      </Link>

      <Card className="mt-4 max-w-xl p-5">
        <h2 className="font-semibold text-hz-navy">Informations plateforme</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-hz-ink/50">Nom de l&apos;application</dt>
            <dd className="text-hz-ink">{APP_NAME}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-hz-ink/50">Durée d&apos;essai gratuit Hôte</dt>
            <dd className="text-hz-ink">{TRIAL_DURATION_DAYS} jours</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-hz-ink/50">Formules d&apos;abonnement</dt>
            <dd className="text-hz-ink">{plansCount ?? 0}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-hz-ink/50">Catégories de biens</dt>
            <dd className="text-hz-ink">{categoriesCount ?? 0}</dd>
          </div>
        </dl>
      </Card>

      <p className="mt-4 max-w-xl text-sm text-hz-ink/50">
        La gestion avancée des paramètres (image de marque, pages légales, options d&apos;activation de
        fonctionnalités) est prévue pour une version ultérieure — voir section 47 du CDC.
      </p>
    </div>
  );
}
