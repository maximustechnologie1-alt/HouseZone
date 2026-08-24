"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type ActionState } from "@/lib/actions/auth";
import { FormField, Input, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Créer un compte</h1>
      <p className="mt-1 text-sm text-hz-ink/60">Rejoignez HouseZone en quelques secondes.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <FormError message={state.error} />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Prénom" htmlFor="firstName">
            <Input id="firstName" name="firstName" required autoComplete="given-name" />
          </FormField>
          <FormField label="Nom" htmlFor="lastName">
            <Input id="lastName" name="lastName" required autoComplete="family-name" />
          </FormField>
        </div>
        <FormField label="Téléphone" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" required placeholder="70 00 00 00" autoComplete="tel" />
        </FormField>
        <FormField label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </FormField>
        <FormField label="Mot de passe" htmlFor="password" hint="8 caractères minimum">
          <Input id="password" name="password" type="password" required autoComplete="new-password" />
        </FormField>
        <label className="flex items-start gap-2 text-xs text-hz-ink/70">
          <input type="checkbox" name="acceptTerms" required className="mt-0.5" />
          J&apos;accepte les{" "}
          <Link href="/conditions-utilisation" className="font-medium text-hz-blue">
            conditions d&apos;utilisation
          </Link>{" "}
          de HouseZone.
        </label>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Création..." : "Créer mon compte"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-hz-ink/60">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-medium text-hz-blue">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
