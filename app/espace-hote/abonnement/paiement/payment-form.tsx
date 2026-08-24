"use client";

import { useActionState } from "react";
import { FormField, Input, Select, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { initiateSubscriptionPaymentAction, type ActionState } from "@/lib/actions/subscriptions";

const initialState: ActionState = {};

export function PaymentForm({ planId }: { planId: string }) {
  const action = initiateSubscriptionPaymentAction.bind(null, planId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.error} />

      <FormField label="Moyen de paiement" htmlFor="method">
        <Select id="method" name="method" defaultValue="mobile_money">
          <option value="mobile_money">Mobile Money</option>
          <option value="carte">Carte bancaire</option>
        </Select>
      </FormField>

      <FormField
        label="Référence de transaction (facultatif)"
        htmlFor="reference"
        hint="Si vous avez déjà effectué le transfert, indiquez la référence reçue par SMS."
      >
        <Input id="reference" name="reference" placeholder="Ex : MP240815.1234" />
      </FormField>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Traitement..." : "Confirmer le paiement"}
      </Button>
    </form>
  );
}
