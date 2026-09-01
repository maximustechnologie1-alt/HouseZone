"use client";

import { useActionState, useState } from "react";
import { FormField, Input, Select, Textarea, FormError, FormSuccess } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import type { City, Neighborhood, PropertyCategory, Listing } from "@/lib/types/database";

interface ActionState {
  error?: string;
  success?: string;
}

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
  const { t } = useI18n();

  const filteredNeighborhoods = neighborhoods.filter((n) => n.city_id === cityId);

  const FEATURES = [
    { key: "piscine", label: t("listing_form.feature_piscine") },
    { key: "climatisation", label: t("listing_form.feature_climatisation") },
    { key: "gardien", label: t("listing_form.feature_gardien") },
    { key: "parking", label: t("listing_form.feature_parking") },
    { key: "terrasse", label: t("listing_form.feature_terrasse") },
    { key: "jardin", label: t("listing_form.feature_jardin") },
    { key: "groupe_electrogene", label: t("listing_form.feature_groupe_electrogene") },
    { key: "forage", label: t("listing_form.feature_forage") },
    { key: "cloture", label: t("listing_form.feature_cloture") },
    { key: "internet", label: t("listing_form.feature_internet") },
  ] as const;

  return (
    <form action={formAction} className="space-y-5">
      <FormSuccess message={state.success} />
      <FormError message={state.error} />

      <FormField label={t("listing_form.title_label")} htmlFor="title">
        <Input id="title" name="title" required defaultValue={listing?.title} placeholder={t("listing_form.title_placeholder")} />
      </FormField>

      <FormField label={t("listing_form.description")} htmlFor="description">
        <Textarea id="description" name="description" required rows={5} defaultValue={listing?.description} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label={t("listing_form.property_type")} htmlFor="categoryId">
          <Select id="categoryId" name="categoryId" required defaultValue={listing?.category_id ?? ""}>
            <option value="" disabled>
              {t("listing_form.choose")}
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={t("listing_form.operation")} htmlFor="operationType">
          <Select id="operationType" name="operationType" required defaultValue={listing?.operation_type ?? "location"}>
            <option value="location">{t("listing_form.location")}</option>
            <option value="vente">{t("listing_form.sale")}</option>
            <option value="reservation">{t("listing_form.reservation")}</option>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label={t("listing_form.city")} htmlFor="cityId">
          <Select
            id="cityId"
            name="cityId"
            required
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
          >
            <option value="" disabled>
              {t("listing_form.choose")}
            </option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={t("listing_form.neighborhood")} htmlFor="neighborhoodId">
          <Select id="neighborhoodId" name="neighborhoodId" defaultValue={listing?.neighborhood_id ?? ""}>
            <option value="">{t("listing_form.not_specified")}</option>
            {filteredNeighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label={t("listing_form.address")} htmlFor="address">
        <Input id="address" name="address" defaultValue={listing?.address ?? ""} />
      </FormField>

      <FormField label={t("listing_form.price")} htmlFor="price" hint={t("listing_form.price_hint")}>
        <Input id="price" name="price" type="number" required min={0} defaultValue={listing?.price} />
      </FormField>

      <div className="grid grid-cols-3 gap-3">
        <FormField label={t("listing_form.bedrooms")} htmlFor="bedrooms">
          <Input id="bedrooms" name="bedrooms" type="number" min={0} defaultValue={listing?.bedrooms ?? ""} />
        </FormField>
        <FormField label={t("listing_form.bathrooms")} htmlFor="bathrooms">
          <Input id="bathrooms" name="bathrooms" type="number" min={0} defaultValue={listing?.bathrooms ?? ""} />
        </FormField>
        <FormField label={t("listing_form.surface")} htmlFor="surfaceM2">
          <Input id="surfaceM2" name="surfaceM2" type="number" min={0} defaultValue={listing?.surface_m2 ?? ""} />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-sm text-hz-ink/80">
        <input type="checkbox" name="furnished" defaultChecked={listing?.furnished} /> {t("listing_form.furnished_checkbox")}
      </label>

      <div>
        <p className="mb-2 text-sm font-medium text-hz-navy">{t("listing_form.features")}</p>
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
        {pending ? t("listing_form.saving") : listing ? t("listing_form.save_changes") : t("listing_form.create")}
      </Button>
    </form>
  );
}
