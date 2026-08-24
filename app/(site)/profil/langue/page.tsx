import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LanguagePicker } from "./language-picker";

export const metadata = { title: "Langue" };

export default async function LanguagePage() {
  const user = await requireUser("/profil/langue");
  const supabase = await createClient();
  const { data: languages } = await supabase.from("languages").select("*").order("name");

  return (
    <div className="hz-container max-w-md py-8">
      <h1 className="text-xl font-semibold text-hz-navy">Langue</h1>
      <p className="mt-1 text-sm text-hz-ink/60">
        HouseZone est disponible en français. D&apos;autres langues seront ajoutées prochainement.
      </p>
      <LanguagePicker languages={languages ?? []} current={user.language} />
    </div>
  );
}
