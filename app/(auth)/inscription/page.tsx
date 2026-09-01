"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type ActionState } from "@/lib/actions/auth";
import { FormField, Input, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";

const initialState: ActionState = {};

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  const { t } = useI18n();

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">{t("auth.signup_title")}</h1>
      <p className="mt-1 text-sm text-hz-ink/60">{t("auth.signup_subtitle")}</p>

      <form action={formAction} className="mt-6 space-y-4">
        <FormError message={state.error ? t(state.error as TranslationKey) : undefined} />
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("auth.first_name_label")} htmlFor="firstName">
            <Input id="firstName" name="firstName" required autoComplete="given-name" />
          </FormField>
          <FormField label={t("auth.last_name_label")} htmlFor="lastName">
            <Input id="lastName" name="lastName" required autoComplete="family-name" />
          </FormField>
        </div>
        <FormField label={t("auth.phone_label")} htmlFor="phone">
          <Input id="phone" name="phone" type="tel" required placeholder={t("auth.phone_placeholder")} autoComplete="tel" />
        </FormField>
        <FormField label={t("auth.email_label")} htmlFor="email">
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </FormField>
        <FormField label={t("auth.password_label")} htmlFor="password" hint={t("auth.password_hint")}>
          <Input id="password" name="password" type="password" required autoComplete="new-password" />
        </FormField>
        <label className="flex items-start gap-2 text-xs text-hz-ink/70">
          <input type="checkbox" name="acceptTerms" required className="mt-0.5" />
          {t("auth.accept_terms_prefix")}{" "}
          <Link href="/conditions-utilisation" className="font-medium text-hz-blue">
            {t("auth.terms_link")}
          </Link>{" "}
          {t("auth.accept_terms_suffix")}
        </label>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("auth.creating_account") : t("auth.create_account_cta")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-hz-ink/60">
        {t("auth.already_registered")}{" "}
        <Link href="/connexion" className="font-medium text-hz-blue">
          {t("auth.sign_in_link")}
        </Link>
      </p>
    </div>
  );
}
