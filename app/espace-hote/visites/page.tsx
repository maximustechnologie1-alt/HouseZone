import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { requireHost } from "@/lib/auth";
import { getHostVisits } from "@/lib/data/visits";
import { EmptyState } from "@/components/ui/empty-state";
import { VisitStatusBadge } from "@/components/visits/visit-status-badge";
import { formatDate } from "@/lib/utils";
import { RescheduleDialog } from "./reschedule-dialog";
import { AcceptRefuseActions, CompleteVisitButton } from "./visit-actions";

export const metadata = { title: "Visites" };

export default async function HostVisitsPage() {
  const { profile } = await requireHost();
  const visits = await getHostVisits(profile.id);

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">Visites</h1>
      <p className="mt-1 text-sm text-hz-ink/60">Gérez les demandes de visite de vos annonces.</p>

      <div className="mt-6 space-y-3">
        {visits.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Aucune demande de visite"
            description="Les demandes de visite envoyées par les clients apparaîtront ici."
          />
        ) : (
          visits.map((visit) => (
            <div key={visit.id} className="rounded-card border border-hz-navy/10 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/biens/${visit.listing?.id}`} className="font-medium text-hz-navy hover:underline">
                    {visit.listing?.title}
                  </Link>
                  <p className="text-sm text-hz-ink/60">{visit.listing?.cities?.name}</p>
                </div>
                <VisitStatusBadge status={visit.status} />
              </div>
              <p className="mt-3 text-sm text-hz-ink/70">
                Demandé pour le {formatDate(visit.requested_date)} à {visit.requested_time}
              </p>
              {visit.client && (
                <p className="mt-1 text-sm text-hz-ink/70">
                  Client : {visit.client.first_name} {visit.client.last_name}
                  {visit.client.phone ? ` · ${visit.client.phone}` : ""}
                </p>
              )}
              {visit.message && <p className="mt-1 text-sm italic text-hz-ink/60">« {visit.message} »</p>}
              {visit.status === "reprogrammation_proposee" && visit.proposed_date && (
                <div className="mt-2 rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-800">
                  Nouvelle date proposée : {formatDate(visit.proposed_date)} à {visit.proposed_time}
                  {visit.host_note && <p className="mt-1 text-xs">{visit.host_note}</p>}
                </div>
              )}

              {visit.status === "en_attente" && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <AcceptRefuseActions visitId={visit.id} />
                  <RescheduleDialog visitId={visit.id} />
                </div>
              )}
              {visit.status === "acceptee" && (
                <div className="mt-3">
                  <CompleteVisitButton visitId={visit.id} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
