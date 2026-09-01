"use client";

import { useActionState } from "react";
import { updateProfileAction, type ActionState } from "@/lib/actions/profile";
import { FormField, Input, FormError, FormSuccess } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";
import type { Profile } from "@/lib/types/database";

const initialState: ActionState = {};

export function SettingsForm({ user }: { user: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
  const { t } = useI18n();

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <FormSuccess message={state.success ? t(state.success as TranslationKey) : undefined} />
      <FormError message={state.error ? t(state.error as TranslationKey) : undefined} />
      <input type="hidden" name="language" value={user.language} />
      <div className="grid grid-cols-2 gap-3">
        <FormField label={t("auth.first_name_label")} htmlFor="firstName">
          <Input id="firstName" name="firstName" defaultValue={user.first_name} required />
        </FormField>
        <FormField label={t("auth.last_name_label")} htmlFor="lastName">
          <Input id="lastName" name="lastName" defaultValue={user.last_name} required />
        </FormField>
      </div>
      <FormField label={t("auth.phone_label")} htmlFor="phone">
        <Input id="phone" name="phone" defaultValue={user.phone ?? ""} required />
      </FormField>
      <FormField label={t("auth.email_label")} htmlFor="email">
        <Input id="email" defaultValue={user.email ?? ""} disabled className="opacity-60" />
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? t("profile.saving") : t("profile.save")}
      </Button>
    </form>
  );
}
