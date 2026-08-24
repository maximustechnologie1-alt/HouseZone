import { BarChart3, Rocket, Sparkles } from "lucide-react";

export const metadata = { title: "Premium" };

const BENEFITS = [
  {
    icon: Rocket,
    title: "Mise en avant des annonces",
    description: "Boostez vos annonces pour apparaître en tête des résultats de recherche pendant une période donnée.",
  },
  {
    icon: Sparkles,
    title: "Annonces illimitées",
    description: "Publiez sans limite de nombre d'annonces actives simultanément.",
  },
  {
    icon: BarChart3,
    title: "Statistiques avancées",
    description: "Accédez à des analyses détaillées de la performance de vos annonces dans le temps.",
  },
];

export default function HostPremiumPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-hz-gold" />
        <h1 className="text-xl font-semibold text-hz-navy">Premium</h1>
      </div>
      <p className="mt-2 text-sm text-hz-ink/60">
        Des fonctionnalités avancées pour donner plus de visibilité à vos annonces.
      </p>

      <div className="mt-6 space-y-3">
        {BENEFITS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-3 rounded-card border border-hz-navy/10 bg-white p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hz-gold/15">
              <Icon className="h-5 w-5 text-hz-gold" />
            </span>
            <div>
              <p className="font-medium text-hz-navy">{title}</p>
              <p className="mt-1 text-sm text-hz-ink/60">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-card border border-dashed border-hz-navy/15 px-6 py-8 text-center">
        <p className="font-medium text-hz-navy">Bientôt disponible</p>
        <p className="mt-1 text-sm text-hz-ink/60">
          Les offres Premium seront proposées prochainement. Restez à l&apos;écoute !
        </p>
      </div>
    </div>
  );
}
