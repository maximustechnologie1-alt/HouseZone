"use client";

import { useActionState } from "react";
import { updateProfileAction, type ActionState } from "@/lib/actions/profile";
import { FormField, Input, FormError, FormSuccess } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types/database";

const initialState: ActionState = {};

export function SettingsForm({ user }: { user: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <FormSuccess message={state.success} />
      <FormError message={state.error} />
      <input type="hidden" name="language" value={user.language} />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Prénom" htmlFor="firstName">
          <Input id="firstName" name="firstName" defaultValue={user.first_name} required />
        </FormField>
        <FormField label="Nom" htmlFor="lastName">
          <Input id="lastName" name="lastName" defaultValue={user.last_name} required />
        </FormField>
      </div>
      <FormField label="Téléphone" htmlFor="phone">
        <Input id="phone" name="phone" defaultValue={user.phone ?? ""} required />
      </FormField>
      <FormField label="Email" htmlFor="email">
        <Input id="email" defaultValue={user.email ?? ""} disabled className="opacity-60" />
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
