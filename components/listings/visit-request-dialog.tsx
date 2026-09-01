"use client";

import { useActionState, useState } from "react";
import { CalendarClock } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { FormField, Input, Textarea, FormError, FormSuccess } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { requestVisitAction, type ActionState } from "@/lib/actions/visits";
import { useI18n } from "@/lib/i18n/context";

const initialState: ActionState = {};

export function VisitRequestDialog({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const action = requestVisitAction.bind(null, listingId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const { t } = useI18n();

  return (
    <>
      <Button variant="gold" size="lg" className="w-full" onClick={() => setOpen(true)}>
        <CalendarClock className="h-4 w-4" /> {t("listing.request_visit")}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={t("listing.visit_dialog_title")}>
        {state.success ? (
          <FormSuccess message={state.success} />
        ) : (
          <form action={formAction} className="space-y-4">
            <FormError message={state.error} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t("listing.visit_date")} htmlFor="requestedDate">
                <Input id="requestedDate" name="requestedDate" type="date" required min={new Date().toISOString().slice(0, 10)} />
              </FormField>
              <FormField label={t("listing.visit_time")} htmlFor="requestedTime">
                <Input id="requestedTime" name="requestedTime" type="time" required />
              </FormField>
            </div>
            <FormField label={t("listing.visit_message")} htmlFor="message">
              <Textarea id="message" name="message" rows={3} placeholder={t("listing.visit_message_placeholder")} />
            </FormField>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? t("listing.sending") : t("listing.send_request")}
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
