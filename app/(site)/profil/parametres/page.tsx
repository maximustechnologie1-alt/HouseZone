import { requireUser } from "@/lib/auth";
import { SettingsForm } from "./settings-form";
import { signOutAllSessionsAction } from "@/lib/actions/profile";
import { getServerLocale } from "@/lib/i18n/get-locale";
import { DICTIONARIES } from "@/lib/i18n/registry";
import { PushNotificationToggle } from "@/components/profile/push-notification-toggle";

export const metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const [user, locale] = await Promise.all([requireUser("/profil/parametres"), getServerLocale()]);
  const t = DICTIONARIES[locale];

  return (
    <div className="hz-container max-w-xl py-8">
      <h1 className="text-xl font-semibold text-hz-navy">{t.profile.account_settings}</h1>

      <SettingsForm user={user} />

      <div className="mt-6 rounded-card border border-hz-navy/10 p-5">
        <PushNotificationToggle initialEnabled={user.push_enabled} />
      </div>

      <div className="mt-6 rounded-card border border-hz-navy/10 p-5">
        <h2 className="font-semibold text-hz-navy">{t.profile.security_title}</h2>
        <p className="mt-1 text-sm text-hz-ink/60">{t.profile.security_description}</p>
        <form action={signOutAllSessionsAction} className="mt-3">
          <button type="submit" className="rounded-full border border-hz-navy/20 px-4 py-2 text-sm font-medium text-hz-navy hover:bg-hz-sky">
            {t.profile.sign_out_all_sessions}
          </button>
        </form>
      </div>
    </div>
  );
}
