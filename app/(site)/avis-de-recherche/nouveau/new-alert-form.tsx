"use client";

import { useActionState } from "react";
import { createSearchAlertAction, type ActionState } from "@/lib/actions/search-alerts";
import { FormField, Input, Select, Textarea, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { City, PropertyCategory } from "@/lib/types/database";

const initialState: ActionState = {};

export function NewAlertForm({ cities, categories }: { cities: City[]; categories: PropertyCategory[] }) {
  const [state, formAction, pending] = useActionState(createSearchAlertAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <FormError message={state.error} />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Type de bien" htmlFor="categoryId">
          <Select id="categoryId" name="categoryId" defaultValue="">
            <option value="">Peu importe</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Ville" htmlFor="cityId">
          <Select id="cityId" name="cityId" defaultValue="">
            <option value="">Peu importe</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Budget min (FCFA)" htmlFor="budgetMin">
          <Input id="budgetMin" name="budgetMin" type="number" />
        </FormField>
        <FormField label="Budget max (FCFA)" htmlFor="budgetMax">
          <Input id="budgetMax" name="budgetMax" type="number" />
        </FormField>
      </div>
      <FormField label="Caractéristiques souhaitées" htmlFor="characteristics" hint="Ex : minimum 3 chambres, cour clôturée...">
        <Input id="characteristics" name="characteristics" />
      </FormField>
      <FormField label="Description de votre recherche" htmlFor="description">
        <Textarea id="description" name="description" rows={4} required placeholder="Je recherche une villa à Ouaga 2000, minimum 3 chambres, budget 500 000 FCFA/mois..." />
      </FormField>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Publication..." : "Publier"}
      </Button>
    </form>
  );
}
