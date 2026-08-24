"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavoriteAction } from "@/lib/actions/favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  listingId,
  initialFavorite,
}: {
  listingId: string;
  initialFavorite: boolean;
}) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={favorite}
      disabled={pending}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const next = !favorite;
        setFavorite(next);
        startTransition(async () => {
          try {
            const result = await toggleFavoriteAction(listingId);
            setFavorite(result.favorite);
            router.refresh();
          } catch {
            setFavorite(!next);
            router.push(`/connexion?next=/biens/${listingId}`);
          }
        });
      }}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white disabled:opacity-60"
    >
      <Heart className={cn("h-4.5 w-4.5", favorite ? "fill-red-500 text-red-500" : "text-hz-navy")} />
    </button>
  );
}
