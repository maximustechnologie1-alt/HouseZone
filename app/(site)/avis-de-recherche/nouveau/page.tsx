import { getCities, getCategories } from "@/lib/data/taxonomies";
import { NewAlertForm } from "./new-alert-form";

export const metadata = { title: "Nouvel avis de recherche" };

export default async function NewSearchAlertPage() {
  const [cities, categories] = await Promise.all([getCities(), getCategories()]);

  return (
    <div className="hz-container max-w-xl py-8">
      <h1 className="text-xl font-semibold text-hz-navy">Publier un avis de recherche</h1>
      <p className="mt-1 text-sm text-hz-ink/60">
        Décrivez ce que vous recherchez : les professionnels vérifiés avec un abonnement actif pourront vous
        contacter s&apos;ils ont un bien correspondant.
      </p>
      <NewAlertForm cities={cities} categories={categories} />
    </div>
  );
}
