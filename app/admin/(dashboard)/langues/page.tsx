import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui/badge";
import { ConfirmActionButton } from "@/components/admin/action-buttons";
import { toggleLanguageActiveAction } from "@/lib/actions/admin";
import type { Language } from "@/lib/types/database";

export const metadata = { title: "Langues" };

export default async function AdminLanguagesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: languages } = await supabase.from("languages").select("*").order("name");

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Langues</h1>

      <Card className="mt-6 p-5">
        <div className="divide-y divide-hz-navy/10">
          {((languages ?? []) as Language[]).map((lang) => (
            <div key={lang.code} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-hz-navy">{lang.name}</span>
                <span className="text-xs uppercase text-hz-ink/40">{lang.code}</span>
                <Badge className={lang.active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}>
                  {lang.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <ConfirmActionButton
                label={lang.active ? "Désactiver" : "Activer"}
                variant="outline"
                action={() => toggleLanguageActiveAction(lang.code, !lang.active)}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
