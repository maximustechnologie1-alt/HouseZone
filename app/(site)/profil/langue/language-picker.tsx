"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { updateLanguageAction } from "@/lib/actions/profile";
import { getLocaleMeta, isLocaleCode } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";
import type { Language } from "@/lib/types/database";

export function LanguagePicker({ languages, current }: { languages: Language[]; current: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const options = languages.filter((l) => isLocaleCode(l.code) && l.active);

  return (
    <div className="mt-6 space-y-2">
      {options.map((lang) => {
        const meta = getLocaleMeta(lang.code);
        return (
          <button
            key={lang.code}
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await updateLanguageAction(lang.code);
                router.refresh();
              })
            }
            className={cn(
              "flex w-full items-center justify-between rounded-xl border border-hz-navy/15 px-4 py-3 text-sm hover:bg-hz-sky",
              current === lang.code && "border-hz-blue bg-hz-sky"
            )}
          >
            <span className="flex items-center gap-2">
              <span aria-hidden="true">{meta.flag}</span>
              {meta.nativeName}
            </span>
            {current === lang.code && <Check className="h-4 w-4 text-hz-blue" />}
          </button>
        );
      })}
    </div>
  );
}
