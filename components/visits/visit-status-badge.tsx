import { Badge } from "@/components/ui/badge";
import { VISIT_STATUS_LABELS } from "@/lib/constants";
import type { VisitStatus } from "@/lib/types/database";

const COLORS: Record<VisitStatus, string> = {
  en_attente: "bg-amber-100 text-amber-700",
  acceptee: "bg-emerald-100 text-emerald-700",
  reprogrammation_proposee: "bg-blue-100 text-blue-700",
  refusee: "bg-red-100 text-red-700",
  annulee: "bg-zinc-100 text-zinc-500",
  terminee: "bg-hz-sky text-hz-navy",
};

export function VisitStatusBadge({ status }: { status: VisitStatus }) {
  return <Badge className={COLORS[status]}>{VISIT_STATUS_LABELS[status]}</Badge>;
}
