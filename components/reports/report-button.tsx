"use client";

import { useActionState, useState } from "react";
import { Flag } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { FormField, Select, Textarea, FormError, FormSuccess } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { createReportAction, type ActionState } from "@/lib/actions/reports";
import { REPORT_REASONS } from "@/lib/constants";
import type { ReportTargetType } from "@/lib/types/database";

const initialState: ActionState = {};

export function ReportButton({
  targetType,
  targetId,
  label = "Signaler",
}: {
  targetType: ReportTargetType;
  targetId: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createReportAction, initialState);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-hz-ink/60 hover:text-red-600"
      >
        <Flag className="h-4 w-4" /> {label}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Signaler">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="targetType" value={targetType} />
          <input type="hidden" name="targetId" value={targetId} />
          <FormSuccess message={state.success} />
          <FormError message={state.error} />
          <FormField label="Motif" htmlFor="reason">
            <Select id="reason" name="reason" required defaultValue="">
              <option value="" disabled>
                Choisissez un motif
              </option>
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Précisions (facultatif)" htmlFor="comment">
            <Textarea id="comment" name="comment" rows={3} />
          </FormField>
          <Button type="submit" variant="danger" className="w-full" disabled={pending}>
            {pending ? "Envoi..." : "Envoyer le signalement"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
