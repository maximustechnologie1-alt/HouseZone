"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, type ActionState } from "@/lib/actions/auth";
import { FormField, Input, FormError, FormSuccess } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

export function SignInForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <FormSuccess message={notice} />
      <FormError message={state.error} />
      <FormField label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </FormField>
      <FormField label="Mot de passe" htmlFor="password">
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </FormField>
      <div className="text-right">
        <Link href="/mot-de-passe-oublie" className="text-xs font-medium text-hz-blue">
          Mot de passe oublié ?
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
