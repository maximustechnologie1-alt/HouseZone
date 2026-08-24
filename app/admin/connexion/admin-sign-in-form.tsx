"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FormField, Input, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

type Step = "credentials" | "mfa-challenge" | "mfa-enroll";

export function AdminSignInForm() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("credentials");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const [factorId, setFactorId] = useState<string>();
  const [qrCode, setQrCode] = useState<string>();
  const [secret, setSecret] = useState<string>();

  async function handleCredentials(formData: FormData) {
    setPending(true);
    setError(undefined);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setPending(false);
      setError("Email ou mot de passe incorrect.");
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role").maybeSingle();
    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setPending(false);
      setError("Ce compte n'a pas accès à l'administration HouseZone.");
      return;
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal.nextLevel !== aal.currentLevel) {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.[0];
      if (totp) {
        setFactorId(totp.id);
        setStep("mfa-challenge");
        setPending(false);
        return;
      }
    }

    // Aucun facteur MFA enrôlé : l'authentification renforcée est
    // obligatoire pour les comptes admin (section 56 du CDC) — on démarre
    // l'enrôlement TOTP immédiatement.
    const { data: enrolled, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (enrollError || !enrolled) {
      setPending(false);
      setError("Impossible de démarrer la double authentification.");
      return;
    }
    setFactorId(enrolled.id);
    setQrCode(enrolled.totp.qr_code);
    setSecret(enrolled.totp.secret);
    setStep("mfa-enroll");
    setPending(false);
  }

  async function handleVerify(formData: FormData) {
    if (!factorId) return;
    setPending(true);
    setError(undefined);
    const code = String(formData.get("code"));

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError || !challenge) {
      setPending(false);
      setError("Erreur lors de la vérification.");
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });

    if (verifyError) {
      setPending(false);
      setError("Code invalide. Réessayez.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-center gap-2 text-hz-navy">
          <ShieldCheck className="h-6 w-6 text-hz-gold" />
          <span className="text-lg font-semibold">Administration HouseZone</span>
        </div>

        {step === "credentials" && (
          <form action={handleCredentials} className="mt-6 space-y-4">
            <FormError message={error} />
            <FormField label="Email" htmlFor="email">
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </FormField>
            <FormField label="Mot de passe" htmlFor="password">
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </FormField>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Connexion..." : "Continuer"}
            </Button>
          </form>
        )}

        {step === "mfa-enroll" && (
          <form action={handleVerify} className="mt-6 space-y-4">
            <FormError message={error} />
            <p className="text-sm text-hz-ink/70">
              Scannez ce code avec une application d&apos;authentification (Google Authenticator, Authy...), ou
              saisissez la clé manuellement.
            </p>
            {qrCode && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrCode} alt="QR code d'authentification" className="mx-auto h-40 w-40" />
            )}
            {secret && <p className="break-all rounded-lg bg-hz-sky px-3 py-2 text-center text-xs">{secret}</p>}
            <FormField label="Code à 6 chiffres" htmlFor="code">
              <Input id="code" name="code" required inputMode="numeric" maxLength={6} autoComplete="one-time-code" />
            </FormField>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Vérification..." : "Activer et se connecter"}
            </Button>
          </form>
        )}

        {step === "mfa-challenge" && (
          <form action={handleVerify} className="mt-6 space-y-4">
            <FormError message={error} />
            <p className="text-sm text-hz-ink/70">Saisissez le code généré par votre application d&apos;authentification.</p>
            <FormField label="Code à 6 chiffres" htmlFor="code">
              <Input id="code" name="code" required inputMode="numeric" maxLength={6} autoComplete="one-time-code" autoFocus />
            </FormField>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Vérification..." : "Se connecter"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
