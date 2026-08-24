import { ShieldAlert } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";

export default function SuspendedAccountPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-hz-sky px-6 text-center">
      <ShieldAlert className="h-10 w-10 text-red-600" />
      <h1 className="text-xl font-semibold text-hz-navy">Compte suspendu</h1>
      <p className="max-w-sm text-sm text-hz-ink/70">
        Votre compte a été suspendu par l&apos;administration HouseZone. Contactez le support si vous pensez qu&apos;il
        s&apos;agit d&apos;une erreur.
      </p>
      <form action={signOutAction}>
        <button type="submit" className="rounded-full border border-hz-navy/20 px-5 py-2.5 text-sm font-medium text-hz-navy">
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
