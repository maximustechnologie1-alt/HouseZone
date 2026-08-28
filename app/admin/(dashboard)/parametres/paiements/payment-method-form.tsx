"use client";

import { useActionState } from "react";
import { FormField, Input, Textarea, FormError, FormSuccess } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { updatePaymentMethodAction, type ActionState } from "@/lib/actions/payment-methods";
import type { PaymentMethodConfig } from "@/lib/types/database";

const initialState: ActionState = {};

export function PaymentMethodForm({
  method,
}: {
  method: PaymentMethodConfig;
  adminId: string;
}) {
  const action = updatePaymentMethodAction.bind(null, method.method);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormSuccess message={state.success} />
      <FormError message={state.error} />

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Nom du bénéficiaire" htmlFor={`${method.method}-accountName`}>
          <Input id={`${method.method}-accountName`} name="accountName" defaultValue={method.account_name} />
        </FormField>
        <FormField label="Numéro de réception" htmlFor={`${method.method}-accountNumber`}>
          <Input id={`${method.method}-accountNumber`} name="accountNumber" defaultValue={method.account_number} />
        </FormField>
      </div>

      <FormField label="Motif de paiement" htmlFor={`${method.method}-paymentReference`}>
        <Input id={`${method.method}-paymentReference`} name="paymentReference" defaultValue={method.payment_reference} />
      </FormField>

      <FormField label="Instructions" htmlFor={`${method.method}-paymentInstructions`}>
        <Textarea
          id={`${method.method}-paymentInstructions`}
          name="paymentInstructions"
          rows={3}
          defaultValue={method.payment_instructions}
        />
      </FormField>

      <label className="flex items-center gap-2 text-sm text-hz-ink/80">
        <input type="checkbox" name="isActive" defaultChecked={method.is_active} /> Actif (visible par les Hôtes)
      </label>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer les modifications"}
      </Button>
    </form>
  );
}
