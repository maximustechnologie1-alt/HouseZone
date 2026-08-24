import { HostApplicationForm } from "./host-application-form";

export const metadata = { title: "Formulaire professionnel" };

export default function HostApplicationFormPage() {
  return (
    <div className="hz-container max-w-lg py-10">
      <h1 className="text-xl font-semibold text-hz-navy">Formulaire professionnel</h1>
      <p className="mt-1 text-sm text-hz-ink/60">
        Choisissez votre profil et complétez les informations demandées.
      </p>
      <HostApplicationForm />
    </div>
  );
}
