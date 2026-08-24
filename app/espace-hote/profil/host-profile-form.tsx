"use client";

import { useActionState } from "react";
import { FormField, Input, Textarea, FormError, FormSuccess } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { updateHostProfileAction, type ActionState } from "@/lib/actions/host-profile";
import type { HostProfile } from "@/lib/types/database";

const initialState: ActionState = {};

export function HostProfileForm({ hostProfile }: { hostProfile: HostProfile }) {
  const [state, formAction, pending] = useActionState(updateHostProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormSuccess message={state.success} />
      <FormError message={state.error} />

      <FormField label="Nom de l'entreprise" htmlFor="companyName">
        <Input id="companyName" name="companyName" defaultValue={hostProfile.company_name ?? ""} />
      </FormField>
      <FormField label="Forme juridique" htmlFor="legalForm">
        <Input id="legalForm" name="legalForm" defaultValue={hostProfile.legal_form ?? ""} placeholder="SARL, SA..." />
      </FormField>
      <FormField label="Numéro d'immatriculation (RCCM)" htmlFor="registrationNumber">
        <Input id="registrationNumber" name="registrationNumber" defaultValue={hostProfile.registration_number ?? ""} />
      </FormField>
      <FormField label="Présentation" htmlFor="bio">
        <Textarea id="bio" name="bio" rows={4} defaultValue={hostProfile.bio ?? ""} />
      </FormField>

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
