"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { upsertNeighborhoodAction } from "@/lib/actions/admin";
import type { City, Neighborhood } from "@/lib/types/database";

export function NeighborhoodsManager({ cities, neighborhoods }: { cities: City[]; neighborhoods: Neighborhood[] }) {
  const [cityId, setCityId] = useState(cities[0]?.id ?? "");
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const filtered = useMemo(() => neighborhoods.filter((n) => n.city_id === cityId), [neighborhoods, cityId]);

  if (cities.length === 0) {
    return <p className="text-sm text-hz-ink/50">Ajoutez d&apos;abord une ville.</p>;
  }

  return (
    <div>
      <Select value={cityId} onChange={(e) => setCityId(e.target.value)} className="max-w-xs">
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <ul className="mt-3 divide-y divide-hz-navy/10 text-sm">
        {filtered.length === 0 && <li className="py-2 text-hz-ink/50">Aucun quartier pour cette ville.</li>}
        {filtered.map((n) => (
          <li key={n.id} className="py-2 text-hz-ink/70">
            {n.name}
          </li>
        ))}
      </ul>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !cityId) return;
          startTransition(async () => {
            await upsertNeighborhoodAction(cityId, name.trim());
            setName("");
            router.refresh();
          });
        }}
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du quartier" className="h-9" />
        <Button type="submit" size="sm" variant="outline" disabled={pending || !name.trim()}>
          {pending ? "..." : "Ajouter"}
        </Button>
      </form>
    </div>
  );
}
