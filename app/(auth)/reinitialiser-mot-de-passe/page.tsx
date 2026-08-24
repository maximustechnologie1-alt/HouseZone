"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ActionState } from "@/lib/actions/auth";
import { FormField, Input, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Nouveau mot de passe</h1>
      <p className="mt-1 text-sm text-hz-ink/60">Choisissez un nouveau mot de passe pour votre compte.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <FormError message={state.error} />
        <FormField label="Nouveau mot de passe" htmlFor="password" hint="8 caractères minimum">
          <Input id="password" name="password" type="password" required autoComplete="new-password" />
        </FormField>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Mise à jour..." : "Mettre à jour"}
        </Button>
      </form>
    </div>
  );
}
