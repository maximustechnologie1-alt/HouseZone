"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, type ActionState } from "@/lib/actions/auth";
import { FormField, Input, FormError, FormSuccess } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";

const initialState: ActionState = {};

export function SignInForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const { t } = useI18n();

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <FormSuccess message={notice} />
      <FormError message={state.error ? t(state.error as TranslationKey) : undefined} />
      <FormField label={t("auth.email_label")} htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </FormField>
      <FormField label={t("auth.password_label")} htmlFor="password">
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </FormField>
      <div className="text-right">
        <Link href="/mot-de-passe-oublie" className="text-xs font-medium text-hz-blue">
          {t("auth.forgot_password_link")}
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("auth.signing_in") : t("auth.sign_in_cta")}
      </Button>
    </form>
  );
}
