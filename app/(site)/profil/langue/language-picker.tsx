"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { updateLanguageAction } from "@/lib/actions/profile";
import { cn } from "@/lib/utils";
import type { Language } from "@/lib/types/database";

export function LanguagePicker({ languages, current }: { languages: Language[]; current: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="mt-6 space-y-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          disabled={!lang.active || pending}
          onClick={() =>
            startTransition(async () => {
              await updateLanguageAction(lang.code);
              router.refresh();
            })
          }
          className={cn(
            "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm",
            lang.active ? "border-hz-navy/15 hover:bg-hz-sky" : "border-hz-navy/10 text-hz-ink/30",
            current === lang.code && "border-hz-blue bg-hz-sky"
          )}
        >
          <span>
            {lang.name} {!lang.active && "(bientôt disponible)"}
          </span>
          {current === lang.code && <Check className="h-4 w-4 text-hz-blue" />}
        </button>
      ))}
    </div>
  );
}
