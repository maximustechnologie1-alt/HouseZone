import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LanguagePicker } from "./language-picker";
import { getServerLocale } from "@/lib/i18n/get-locale";
import { DICTIONARIES } from "@/lib/i18n/registry";

export const metadata = { title: "Langue" };

export default async function LanguagePage() {
  const [user, locale] = await Promise.all([requireUser("/profil/langue"), getServerLocale()]);
  const supabase = await createClient();
  const { data: languages } = await supabase.from("languages").select("*").order("name");
  const t = DICTIONARIES[locale];

  return (
    <div className="hz-container max-w-md py-8">
      <h1 className="text-xl font-semibold text-hz-navy">{t.profile.language_link}</h1>
      <p className="mt-1 text-sm text-hz-ink/60">{t.profile.language_description}</p>
      <LanguagePicker languages={languages ?? []} current={user.language} />
    </div>
  );
}
