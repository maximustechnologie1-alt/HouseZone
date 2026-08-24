"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { updateSubscriptionPriceAction } from "@/lib/actions/admin";

export function SubscriptionPriceForm({ planId, adminId, initialPrice }: { planId: string; adminId: string; initialPrice: number }) {
  const [price, setPrice] = useState(String(initialPrice));
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={0}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="h-9 w-32"
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending || Number(price) === initialPrice || price === ""}
        onClick={() =>
          startTransition(async () => {
            await updateSubscriptionPriceAction(planId, Number(price), adminId);
            router.refresh();
          })
        }
      >
        {pending ? "..." : "Enregistrer"}
      </Button>
    </div>
  );
}
