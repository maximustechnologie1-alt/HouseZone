"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { FormField, Input, Textarea, FormError, FormSuccess } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { proposeRescheduleAction, type ActionState } from "@/lib/actions/visits";

const initialState: ActionState = {};

export function RescheduleDialog({ visitId }: { visitId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const action = proposeRescheduleAction.bind(null, visitId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Reprogrammer
      </Button>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          if (state.success) router.refresh();
        }}
        title="Proposer une nouvelle date"
      >
        {state.success ? (
          <FormSuccess message={state.success} />
        ) : (
          <form action={formAction} className="space-y-4">
            <FormError message={state.error} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Nouvelle date" htmlFor="proposedDate">
                <Input
                  id="proposedDate"
                  name="proposedDate"
                  type="date"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                />
              </FormField>
              <FormField label="Heure" htmlFor="proposedTime">
                <Input id="proposedTime" name="proposedTime" type="time" required />
              </FormField>
            </div>
            <FormField label="Note (facultatif)" htmlFor="hostNote">
              <Textarea id="hostNote" name="hostNote" rows={3} placeholder="Précisez le motif du changement..." />
            </FormField>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Envoi..." : "Proposer cette date"}
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
