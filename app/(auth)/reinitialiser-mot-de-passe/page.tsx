"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ActionState } from "@/lib/actions/auth";
import { FormField, Input, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";

const initialState: ActionState = {};

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);
  const { t } = useI18n();

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">{t("auth.reset_title")}</h1>
      <p className="mt-1 text-sm text-hz-ink/60">{t("auth.reset_subtitle")}</p>

      <form action={formAction} className="mt-6 space-y-4">
        <FormError message={state.error ? t(state.error as TranslationKey) : undefined} />
        <FormField label={t("auth.new_password_label")} htmlFor="password" hint={t("auth.password_hint")}>
          <Input id="password" name="password" type="password" required autoComplete="new-password" />
        </FormField>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("auth.updating") : t("auth.update_cta")}
        </Button>
      </form>
    </div>
  );
}
