import { requireUser } from "@/lib/auth";
import { SettingsForm } from "./settings-form";
import { signOutAllSessionsAction } from "@/lib/actions/profile";

export const metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const user = await requireUser("/profil/parametres");

  return (
    <div className="hz-container max-w-xl py-8">
      <h1 className="text-xl font-semibold text-hz-navy">Paramètres du compte</h1>

      <SettingsForm user={user} />

      <div className="mt-10 rounded-card border border-hz-navy/10 p-5">
        <h2 className="font-semibold text-hz-navy">Sécurité</h2>
        <p className="mt-1 text-sm text-hz-ink/60">
          Déconnectez-vous de tous les appareils connectés à votre compte.
        </p>
        <form action={signOutAllSessionsAction} className="mt-3">
          <button type="submit" className="rounded-full border border-hz-navy/20 px-4 py-2 text-sm font-medium text-hz-navy hover:bg-hz-sky">
            Déconnecter toutes les sessions
          </button>
        </form>
      </div>
    </div>
  );
}
