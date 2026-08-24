"use client";

import { useActionState, useState } from "react";
import { submitHostApplicationAction, type ActionState } from "@/lib/actions/host-application";
import { FormField, Input, Select, Textarea, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { HOST_TYPE_DESCRIPTIONS, HOST_TYPE_LABELS } from "@/lib/constants";
import type { HostType } from "@/lib/types/database";

const initialState: ActionState = {};

export function HostApplicationForm() {
  const [hostType, setHostType] = useState<HostType>("proprietaire");
  const [state, formAction, pending] = useActionState(submitHostApplicationAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <FormError message={state.error} />

      <FormField label="Type d'Hôte" htmlFor="hostType">
        <Select
          id="hostType"
          name="hostType"
          value={hostType}
          onChange={(e) => setHostType(e.target.value as HostType)}
        >
          {(Object.keys(HOST_TYPE_LABELS) as HostType[]).map((type) => (
            <option key={type} value={type}>
              {HOST_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
        <p className="mt-1 text-xs text-hz-ink/50">{HOST_TYPE_DESCRIPTIONS[hostType]}</p>
      </FormField>

      {(hostType === "agence") && (
        <>
          <FormField label="Nom de l'agence" htmlFor="companyName">
            <Input id="companyName" name="companyName" required />
          </FormField>
          <FormField label="Forme juridique" htmlFor="legalForm">
            <Input id="legalForm" name="legalForm" placeholder="SARL, SA..." />
          </FormField>
          <FormField label="Numéro d'immatriculation (RCCM)" htmlFor="registrationNumber">
            <Input id="registrationNumber" name="registrationNumber" required />
          </FormField>
        </>
      )}

      {hostType === "gestionnaire" && (
        <>
          <FormField label="Entreprise (facultatif)" htmlFor="companyName">
            <Input id="companyName" name="companyName" />
          </FormField>
          <FormField label="Âge" htmlFor="age">
            <Input id="age" name="age" type="number" min={18} required />
          </FormField>
        </>
      )}

      {hostType === "demarcheur" && (
        <FormField label="Âge" htmlFor="age" hint="18 ans minimum">
          <Input id="age" name="age" type="number" min={18} required />
        </FormField>
      )}

      <FormField label="Présentation (facultatif)" htmlFor="bio">
        <Textarea id="bio" name="bio" rows={3} placeholder="Quelques mots sur votre activité..." />
      </FormField>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Envoi..." : "Continuer vers les documents"}
      </Button>
    </form>
  );
}
