import { cn } from "@/lib/utils";
import { BadgeCheck } from "lucide-react";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", className)}>
      {children}
    </span>
  );
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-hz-gold/15 px-2.5 py-1 text-xs font-semibold text-hz-navy",
        className
      )}
      title="Hôte vérifié par HouseZone"
    >
      <BadgeCheck className="h-3.5 w-3.5 text-hz-gold" strokeWidth={2.5} />
      Vérifié
    </span>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-card border border-hz-navy/10 bg-white shadow-sm", className)}>{children}</div>
  );
}
