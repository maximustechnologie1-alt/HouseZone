"use client";

import { useActionState, useState } from "react";
import { CalendarClock } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { FormField, Input, Textarea, FormError, FormSuccess } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { requestVisitAction, type ActionState } from "@/lib/actions/visits";

const initialState: ActionState = {};

export function VisitRequestDialog({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const action = requestVisitAction.bind(null, listingId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <>
      <Button variant="gold" size="lg" className="w-full" onClick={() => setOpen(true)}>
        <CalendarClock className="h-4 w-4" /> Demander une visite
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Demander une visite">
        {state.success ? (
          <FormSuccess message={state.success} />
        ) : (
          <form action={formAction} className="space-y-4">
            <FormError message={state.error} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Date souhaitée" htmlFor="requestedDate">
                <Input id="requestedDate" name="requestedDate" type="date" required min={new Date().toISOString().slice(0, 10)} />
              </FormField>
              <FormField label="Heure" htmlFor="requestedTime">
                <Input id="requestedTime" name="requestedTime" type="time" required />
              </FormField>
            </div>
            <FormField label="Message (facultatif)" htmlFor="message">
              <Textarea id="message" name="message" rows={3} placeholder="Précisez votre disponibilité..." />
            </FormField>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Envoi..." : "Envoyer la demande"}
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
