import Link from "next/link";
import { Sparkles } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/listings/property-card";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata = { title: "Premium" };

export default async function AdminPremiumPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("listings")
    .select("id, title, price, boosted_until, profiles!listings_host_id_fkey ( first_name, last_name )")
    .not("boosted_until", "is", null)
    .gt("boosted_until", new Date().toISOString())
    .order("boosted_until", { ascending: true })
    .limit(50);

  type Row = {
    id: string;
    title: string;
    price: number;
    boosted_until: string;
    profiles: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
  };

  const rows = (data ?? []) as Row[];

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Premium</h1>
      <p className="mt-1 max-w-2xl text-sm text-hz-ink/60">
        La gestion complète des formules Premium (achat en ligne, mise en avant configurable) est prévue post-V1
        (voir section 76 du CDC). Cette page liste pour l&apos;instant les annonces actuellement boostées.
      </p>

      <div className="mt-5 overflow-x-auto rounded-card border border-hz-navy/10 bg-white">
        {rows.length === 0 ? (
          <EmptyState icon={Sparkles} title="Aucune annonce boostée" description="Aucune annonce n'est actuellement mise en avant." />
        ) : (
          <table className="w-full min-w-[700px] text-sm">
            <thead className="text-left text-xs uppercase text-hz-ink/50">
              <tr>
                <th className="px-4 py-3">Annonce</th>
                <th className="px-4 py-3">Hôte</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3">Boost jusqu&apos;au</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hz-navy/10">
              {rows.map((l) => {
                const host = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles;
                return (
                  <tr key={l.id}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/annonces/${l.id}`} className="font-medium text-hz-navy hover:underline">
                        {l.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-hz-ink/70">{host ? `${host.first_name} ${host.last_name}` : "—"}</td>
                    <td className="px-4 py-3 text-hz-ink/70">{formatPrice(l.price)}</td>
                    <td className="px-4 py-3 text-hz-ink/60">{formatDate(l.boosted_until)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
