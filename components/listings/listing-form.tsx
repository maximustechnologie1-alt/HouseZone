"use client";

import { useActionState, useState } from "react";
import { FormField, Input, Select, Textarea, FormError, FormSuccess } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { City, Neighborhood, PropertyCategory, Listing } from "@/lib/types/database";

interface ActionState {
  error?: string;
  success?: string;
}

const FEATURES = [
  { key: "piscine", label: "Piscine" },
  { key: "climatisation", label: "Climatisation" },
  { key: "gardien", label: "Gardien" },
  { key: "parking", label: "Parking" },
  { key: "terrasse", label: "Terrasse" },
  { key: "jardin", label: "Jardin" },
  { key: "groupe_electrogene", label: "Groupe électrogène" },
  { key: "forage", label: "Forage" },
  { key: "cloture", label: "Clôturé" },
  { key: "internet", label: "Internet" },
] as const;

export function ListingForm({
  action,
  cities,
  neighborhoods,
  categories,
  listing,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  cities: City[];
  neighborhoods: Neighborhood[];
  categories: PropertyCategory[];
  listing?: Listing;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ActionState);
  const [cityId, setCityId] = useState(listing?.city_id ?? "");

  const filteredNeighborhoods = neighborhoods.filter((n) => n.city_id === cityId);

  return (
    <form action={formAction} className="space-y-5">
      <FormSuccess message={state.success} />
      <FormError message={state.error} />

      <FormField label="Titre de l'annonce" htmlFor="title">
        <Input id="title" name="title" required defaultValue={listing?.title} placeholder="Villa 4 chambres à Ouaga 2000" />
      </FormField>

      <FormField label="Description" htmlFor="description">
        <Textarea id="description" name="description" required rows={5} defaultValue={listing?.description} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Type de bien" htmlFor="categoryId">
          <Select id="categoryId" name="categoryId" required defaultValue={listing?.category_id ?? ""}>
            <option value="" disabled>
              Choisir
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Opération" htmlFor="operationType">
          <Select id="operationType" name="operationType" required defaultValue={listing?.operation_type ?? "location"}>
            <option value="location">Location</option>
            <option value="vente">Vente</option>
            <option value="reservation">Réservation (meublé)</option>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Ville" htmlFor="cityId">
          <Select
            id="cityId"
            name="cityId"
            required
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
          >
            <option value="" disabled>
              Choisir
            </option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Quartier" htmlFor="neighborhoodId">
          <Select id="neighborhoodId" name="neighborhoodId" defaultValue={listing?.neighborhood_id ?? ""}>
            <option value="">Non précisé</option>
            {filteredNeighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Adresse (facultatif)" htmlFor="address">
        <Input id="address" name="address" defaultValue={listing?.address ?? ""} />
      </FormField>

      <FormField label="Prix (FCFA)" htmlFor="price" hint="Loyer mensuel pour une location">
        <Input id="price" name="price" type="number" required min={0} defaultValue={listing?.price} />
      </FormField>

      <div className="grid grid-cols-3 gap-3">
        <FormField label="Chambres" htmlFor="bedrooms">
          <Input id="bedrooms" name="bedrooms" type="number" min={0} defaultValue={listing?.bedrooms ?? ""} />
        </FormField>
        <FormField label="Salles de bain" htmlFor="bathrooms">
          <Input id="bathrooms" name="bathrooms" type="number" min={0} defaultValue={listing?.bathrooms ?? ""} />
        </FormField>
        <FormField label="Surface (m²)" htmlFor="surfaceM2">
          <Input id="surfaceM2" name="surfaceM2" type="number" min={0} defaultValue={listing?.surface_m2 ?? ""} />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-sm text-hz-ink/80">
        <input type="checkbox" name="furnished" defaultChecked={listing?.furnished} /> Bien meublé
      </label>

      <div>
        <p className="mb-2 text-sm font-medium text-hz-navy">Caractéristiques</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <label key={f.key} className="flex items-center gap-2 text-sm text-hz-ink/80">
              <input
                type="checkbox"
                name={`feature_${f.key}`}
                defaultChecked={Boolean(listing?.features?.[f.key])}
              />
              {f.label}
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Enregistrement..." : listing ? "Enregistrer les modifications" : "Créer l'annonce"}
      </Button>
    </form>
  );
}
