import { redirect } from "next/navigation";
import { requireUser, getHostProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DocumentUploadForm } from "./document-upload-form";
import { finalizeHostApplicationAction } from "@/lib/actions/host-application";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const user = await requireUser("/devenir-hote/documents");
  const hostProfile = await getHostProfile(user.id);

  if (!hostProfile) redirect("/devenir-hote/formulaire");

  const supabase = await createClient();
  const { data: documents } = await supabase
    .from("verification_documents")
    .select("*")
    .eq("host_profile_id", hostProfile.id)
    .order("uploaded_at", { ascending: false });

  return (
    <div className="hz-container max-w-lg py-10">
      <h1 className="text-xl font-semibold text-hz-navy">Documents de vérification</h1>
      <p className="mt-1 text-sm text-hz-ink/60">
        Ces documents sont strictement privés : ils ne sont jamais visibles par les clients, seule notre équipe de
        vérification y a accès.
      </p>

      <DocumentUploadForm />

      {documents && documents.length > 0 && (
        <div className="mt-6 space-y-2">
          <p className="text-sm font-medium text-hz-navy">Documents envoyés</p>
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between rounded-xl border border-hz-navy/10 px-3 py-2 text-sm">
              <span className="capitalize text-hz-ink/80">{doc.doc_type.replace(/_/g, " ")}</span>
              <span className="text-xs text-hz-ink/40">{doc.status === "en_cours" ? "En vérification" : doc.status}</span>
            </div>
          ))}
        </div>
      )}

      <form action={finalizeHostApplicationAction} className="mt-8">
        <Button
          type="submit"
          className="w-full"
          disabled={!documents || documents.length === 0}
        >
          Envoyer mon dossier pour vérification
        </Button>
        {(!documents || documents.length === 0) && (
          <p className="mt-2 text-center text-xs text-hz-ink/50">Ajoutez au moins un document pour continuer.</p>
        )}
      </form>
    </div>
  );
}
