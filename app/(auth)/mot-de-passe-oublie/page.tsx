"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction, type ActionState } from "@/lib/actions/auth";
import { FormField, Input, FormError, FormSuccess } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";

const initialState: ActionState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);
  const { t } = useI18n();

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">{t("auth.forgot_title")}</h1>
      <p className="mt-1 text-sm text-hz-ink/60">{t("auth.forgot_subtitle")}</p>

      <form action={formAction} className="mt-6 space-y-4">
        <FormSuccess message={state.success ? t(state.success as TranslationKey) : undefined} />
        <FormError message={state.error ? t(state.error as TranslationKey) : undefined} />
        <FormField label={t("auth.email_label")} htmlFor="email">
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </FormField>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("auth.sending_link") : t("auth.send_link_cta")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-hz-ink/60">
        <Link href="/connexion" className="font-medium text-hz-blue">
          {t("auth.back_to_signin")}
        </Link>
      </p>
    </div>
  );
}
