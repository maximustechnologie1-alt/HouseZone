import Link from "next/link";
import { cn } from "@/lib/utils";

export function StatusTabs({
  basePath,
  paramName = "statut",
  current,
  tabs,
}: {
  basePath: string;
  paramName?: string;
  current: string;
  tabs: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-hz-navy/10 pb-3">
      {tabs.map((tab) => {
        const isActive = current === tab.value;
        const href = tab.value ? `${basePath}?${paramName}=${tab.value}` : basePath;
        return (
          <Link
            key={tab.value || "all"}
            href={href}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive ? "bg-hz-navy text-white" : "bg-hz-sky text-hz-navy hover:bg-hz-navy/10"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
