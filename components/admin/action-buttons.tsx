"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";

type Variant = "primary" | "gold" | "outline" | "ghost" | "danger";

// Bouton qui ouvre une modale avec un champ texte (raison / notes) puis
// appelle l'action serveur liée avec cette valeur — pattern réutilisé pour
// toutes les décisions admin qui exigent une justification.
export function ReasonActionButton({
  label,
  title,
  actionLabel,
  variant = "outline",
  action,
  placeholder = "Raison...",
  requireReason = true,
}: {
  label: string;
  title: string;
  actionLabel: string;
  variant?: Variant;
  action: (reason: string) => Promise<void>;
  placeholder?: string;
  requireReason?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <>
      <Button type="button" variant={variant} size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <div className="space-y-4">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
          <Button
            type="button"
            variant={variant}
            className="w-full"
            disabled={pending || (requireReason && reason.trim().length === 0)}
            onClick={() =>
              startTransition(async () => {
                await action(reason);
                setOpen(false);
                setReason("");
                router.refresh();
              })
            }
          >
            {pending ? "Envoi..." : actionLabel}
          </Button>
        </div>
      </Modal>
    </>
  );
}

// Bouton simple avec confirmation navigateur, pour les actions sans raison
// à saisir (réactivation, approbation, toggles).
export function ConfirmActionButton({
  label,
  confirmMessage,
  variant = "outline",
  action,
}: {
  label: string;
  confirmMessage?: string;
  variant?: Variant;
  action: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      disabled={pending}
      onClick={() => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        startTransition(async () => {
          await action();
          router.refresh();
        });
      }}
    >
      {pending ? "..." : label}
    </Button>
  );
}
