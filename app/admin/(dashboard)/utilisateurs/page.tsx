import Link from "next/link";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { UserStatusBadge } from "@/components/admin/status-badges";
import { UserStatusActions } from "@/components/admin/user-status-actions";
import { EmptyState } from "@/components/listings/property-card";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";

export const metadata = { title: "Utilisateurs" };

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/utilisateurs">) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, first_name, last_name, email, phone, role, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (q) {
    query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: users } = await query;
  const rows = (users ?? []) as Profile[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-hz-navy">Utilisateurs</h1>
      </div>

      <form className="mt-4 flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hz-ink/40" />
          <Input name="q" defaultValue={q} placeholder="Nom ou e-mail..." className="pl-9" />
        </div>
        <Button type="submit" variant="outline">
          Rechercher
        </Button>
      </form>

      <div className="mt-5 overflow-x-auto rounded-card border border-hz-navy/10 bg-white">
        {rows.length === 0 ? (
          <EmptyState icon={Search} title="Aucun utilisateur" description="Aucun résultat pour cette recherche." />
        ) : (
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-left text-xs uppercase text-hz-ink/50">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Inscrit le</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hz-navy/10">
              {rows.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/utilisateurs/${u.id}`} className="font-medium text-hz-navy hover:underline">
                      {u.first_name} {u.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-hz-ink/70">
                    <p>{u.email ?? "—"}</p>
                    <p className="text-xs text-hz-ink/50">{u.phone ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-hz-ink/70">{u.role}</td>
                  <td className="px-4 py-3">
                    <UserStatusBadge status={u.status} />
                  </td>
                  <td className="px-4 py-3 text-hz-ink/60">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <UserStatusActions userId={u.id} adminId={admin.id} status={u.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
