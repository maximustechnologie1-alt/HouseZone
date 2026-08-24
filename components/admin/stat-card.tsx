import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-card border border-hz-navy/10 bg-white p-4", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-hz-ink/50">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-hz-navy">{value}</p>
      {hint && <p className="mt-1 text-xs text-hz-ink/50">{hint}</p>}
    </div>
  );
}
