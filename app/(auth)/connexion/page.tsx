import Link from "next/link";
import { SignInForm } from "./sign-in-form";

export default async function SignInPage({
  searchParams,
}: PageProps<"/connexion">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const notice = params.inscrit
    ? "Compte créé. Vérifiez votre email si nécessaire, puis connectez-vous."
    : params.reinitialise
    ? "Mot de passe mis à jour. Connectez-vous."
    : undefined;

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Connexion</h1>
      <p className="mt-1 text-sm text-hz-ink/60">Accédez à votre espace HouseZone.</p>

      <SignInForm next={next} notice={notice} />

      <p className="mt-6 text-center text-sm text-hz-ink/60">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-medium text-hz-blue">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
