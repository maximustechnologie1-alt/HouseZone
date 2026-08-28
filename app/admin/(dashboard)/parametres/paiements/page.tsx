import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllPaymentMethods } from "@/lib/data/payment-methods";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_EMOJI, PAYMENT_METHOD_COLORS } from "@/lib/constants";
import { PaymentMethodForm } from "./payment-method-form";

export const metadata = { title: "Paramètres · Paiements" };

export default async function AdminPaymentMethodsPage() {
  const admin = await requireAdmin();
  const methods = await getAllPaymentMethods();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/parametres" className="text-sm font-medium text-hz-blue hover:underline">
        ← Retour aux paramètres
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-hz-navy">Moyens de paiement</h1>
      <p className="mt-1 text-sm text-hz-ink/60">
        Ces coordonnées sont affichées aux Hôtes lorsqu&apos;ils souscrivent à un abonnement. Aucun numéro n&apos;est
        codé en dur : tout est stocké ici, dans Supabase. Un moyen désactivé n&apos;apparaît plus comme option pour
        les utilisateurs, mais ses anciennes demandes restent visibles dans l&apos;historique.
      </p>

      <div className="mt-6 space-y-6">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`rounded-card border p-5 ${PAYMENT_METHOD_COLORS[method.method]}`}
          >
            <p className="flex items-center gap-2 font-semibold text-hz-navy">
              <span className="text-lg">{PAYMENT_METHOD_EMOJI[method.method]}</span>
              {PAYMENT_METHOD_LABELS[method.method]}
            </p>
            <div className="mt-4">
              <PaymentMethodForm method={method} adminId={admin.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
