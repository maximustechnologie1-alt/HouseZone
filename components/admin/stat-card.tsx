import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: number | null;
  className?: string;
}) {
  return (
    <div className={cn("rounded-card border border-hz-navy/10 bg-white p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-hz-ink/50">{label}</p>
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-hz-blue/10">
            <Icon className="h-4 w-4 text-hz-blue" />
          </span>
        )}
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <p className="text-2xl font-bold text-hz-navy">{value}</p>
        {typeof trend === "number" && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-xs font-semibold",
              trend >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            )}
          >
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-hz-ink/50">{hint}</p>}
    </div>
  );
}
