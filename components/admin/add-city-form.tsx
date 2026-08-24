"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { upsertCityAction } from "@/lib/actions/admin";

export function AddCityForm({ adminId }: { adminId: string }) {
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        startTransition(async () => {
          await upsertCityAction(adminId, name.trim());
          setName("");
          router.refresh();
        });
      }}
    >
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de la ville" className="h-9" />
      <Button type="submit" size="sm" variant="outline" disabled={pending || !name.trim()}>
        {pending ? "..." : "Ajouter"}
      </Button>
    </form>
  );
}
