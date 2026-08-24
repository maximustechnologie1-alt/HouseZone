import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { initials } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";

export function AdminUserMenu({ profile }: { profile: Profile }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right text-xs">
        <p className="font-medium text-hz-navy">
          {profile.first_name} {profile.last_name}
        </p>
        <p className="text-hz-ink/50">Administrateur</p>
      </div>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-hz-navy text-xs font-semibold text-white">
        {initials(profile.first_name, profile.last_name)}
      </span>
      <form action={signOutAction}>
        <button type="submit" className="flex h-9 w-9 items-center justify-center rounded-full text-hz-navy hover:bg-hz-sky" aria-label="Déconnexion">
          <LogOut className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
