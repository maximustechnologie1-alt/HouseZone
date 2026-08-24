import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getClientVisits } from "@/lib/data/visits";
import { EmptyState } from "@/components/listings/property-card";
import { VisitStatusBadge } from "@/components/visits/visit-status-badge";
import { formatDate, formatPrice } from "@/lib/utils";
import { CancelVisitButton } from "./cancel-visit-button";

export const metadata = { title: "Mes visites" };

export default async function VisitsPage() {
  const user = await requireUser("/visites");
  const visits = await getClientVisits(user.id);

  return (
    <div className="hz-container py-8">
      <h1 className="text-xl font-semibold text-hz-navy">Mes visites</h1>

      <div className="mt-6 space-y-3">
        {visits.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Aucune demande de visite"
            description="Vos demandes de visite apparaîtront ici une fois envoyées depuis une annonce."
          />
        ) : (
          visits.map((visit) => (
            <div key={visit.id} className="rounded-card border border-hz-navy/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/biens/${visit.listing?.id}`} className="font-medium text-hz-navy hover:underline">
                    {visit.listing?.title}
                  </Link>
                  <p className="text-sm text-hz-ink/60">
                    {visit.listing?.cities?.name} · {formatPrice(visit.listing?.price ?? 0)}
                  </p>
                </div>
                <VisitStatusBadge status={visit.status} />
              </div>
              <p className="mt-3 text-sm text-hz-ink/70">
                Demandé pour le {formatDate(visit.requested_date)} à {visit.requested_time}
              </p>
              {visit.status === "reprogrammation_proposee" && visit.proposed_date && (
                <div className="mt-2 rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-800">
                  Nouvelle date proposée par l&apos;Hôte : {formatDate(visit.proposed_date)} à {visit.proposed_time}
                  {visit.host_note && <p className="mt-1 text-xs">{visit.host_note}</p>}
                </div>
              )}
              {["en_attente", "acceptee", "reprogrammation_proposee"].includes(visit.status) && (
                <div className="mt-3">
                  <CancelVisitButton visitId={visit.id} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
