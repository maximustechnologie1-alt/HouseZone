"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction, type ActionState } from "@/lib/actions/auth";
import { FormField, Input, FormError, FormSuccess } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Mot de passe oublié</h1>
      <p className="mt-1 text-sm text-hz-ink/60">
        Renseignez votre email, nous vous enverrons un lien de réinitialisation.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <FormSuccess message={state.success} />
        <FormError message={state.error} />
        <FormField label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </FormField>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Envoi..." : "Envoyer le lien"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-hz-ink/60">
        <Link href="/connexion" className="font-medium text-hz-blue">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
