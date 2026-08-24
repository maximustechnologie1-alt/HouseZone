"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadVerificationDocumentAction } from "@/lib/actions/host-application";
import { FormField, Select, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const DOC_TYPES = [
  { value: "cni", label: "Carte nationale d'identité" },
  { value: "passeport", label: "Passeport" },
  { value: "carte_consulaire", label: "Carte consulaire" },
  { value: "rccm", label: "Registre de commerce (RCCM)" },
  { value: "autre", label: "Autre document" },
];

export function DocumentUploadForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  return (
    <form
      ref={formRef}
      className="mt-6 space-y-4"
      action={(formData) =>
        startTransition(async () => {
          const result = await uploadVerificationDocumentAction(formData);
          if (result.error) setError(result.error);
          else {
            setError(undefined);
            formRef.current?.reset();
            router.refresh();
          }
        })
      }
    >
      {error && <p className="text-sm text-red-600">{error}</p>}
      <FormField label="Type de document" htmlFor="docType">
        <Select id="docType" name="docType" defaultValue="cni">
          {DOC_TYPES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Fichier" htmlFor="file">
        <Input id="file" name="file" type="file" accept="image/*,.pdf" required />
      </FormField>
      <Button type="submit" variant="outline" className="w-full" disabled={pending}>
        {pending ? "Envoi..." : "Ajouter le document"}
      </Button>
    </form>
  );
}
