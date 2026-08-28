import { HelpCircle, Mail, ShieldCheck, Flag } from "lucide-react";

export const metadata = { title: "Centre d'aide" };

export default function HelpPage() {
  return (
    <div className="hz-container max-w-2xl py-10">
      <h1 className="text-2xl font-semibold text-hz-navy">Centre d&apos;aide</h1>
      <p className="mt-2 text-sm text-hz-ink/70">
        Retrouvez ici les réponses aux questions les plus fréquentes sur HouseZone, ainsi que les moyens de nous
        contacter ou de signaler un problème.
      </p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-hz-navy">
            <HelpCircle className="h-5 w-5 text-hz-blue" /> Questions fréquentes
          </h2>
          <div className="mt-3 space-y-3 text-sm text-hz-ink/80">
            <div>
              <p className="font-medium text-hz-navy">Comment publier une annonce ?</p>
              <p className="mt-1">
                Créez un compte, puis rendez-vous dans le menu → « Devenir Hôte » pour activer votre profil
                professionnel. Une fois vérifié, vous pouvez publier vos biens depuis votre espace Hôte.
              </p>
            </div>
            <div>
              <p className="font-medium text-hz-navy">Comment demander une visite ?</p>
              <p className="mt-1">
                Ouvrez la fiche d&apos;un bien puis cliquez sur « Demander une visite ». L&apos;Hôte confirme,
                refuse ou propose une nouvelle date directement depuis la messagerie.
              </p>
            </div>
            <div>
              <p className="font-medium text-hz-navy">Comment fonctionne le badge « Hôte vérifié » ?</p>
              <p className="mt-1">
                Il est attribué par l&apos;équipe HouseZone après vérification du dossier professionnel de
                l&apos;Hôte — il ne s&apos;obtient jamais automatiquement en payant un abonnement.
              </p>
            </div>
          </div>
        </section>

        <section id="securite">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-hz-navy">
            <ShieldCheck className="h-5 w-5 text-hz-blue" /> Sécurité HouseZone
          </h2>
          <p className="mt-3 text-sm text-hz-ink/80">
            Toute la messagerie passe par HouseZone : les numéros de téléphone, emails et liens externes sont
            automatiquement filtrés pour éviter les tentatives de contournement. Ne communiquez jamais vos
            coordonnées personnelles ni ne payez en dehors de la plateforme avant d&apos;avoir vérifié le bien et
            l&apos;Hôte. Méfiez-vous de toute offre trop avantageuse.
          </p>
        </section>

        <section id="signaler">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-hz-navy">
            <Flag className="h-5 w-5 text-hz-blue" /> Signaler un problème
          </h2>
          <p className="mt-3 text-sm text-hz-ink/80">
            Depuis une annonce, un profil ou une conversation, utilisez le bouton « Signaler » pour transmettre le
            problème à notre équipe de modération. Pour tout autre incident, écrivez-nous directement (voir
            ci-dessous).
          </p>
        </section>

        <section id="contact">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-hz-navy">
            <Mail className="h-5 w-5 text-hz-blue" /> Nous contacter
          </h2>
          <p className="mt-3 text-sm text-hz-ink/80">
            Une question, une suggestion ou besoin d&apos;assistance ?{" "}
            <a href="mailto:contact@housezone.bf" className="font-medium text-hz-blue">
              contact@housezone.bf
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
