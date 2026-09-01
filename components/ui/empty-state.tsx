import type { ComponentType, ReactNode } from "react";

// Deliberately not "use client": rendered from server-component pages
// (search results, favorites, admin lists...) which pass an icon component
// as a prop — importing this from a "use client" module would turn that
// prop into a non-serializable function crossing the server/client
// boundary and crash the render (see property-card.tsx for the
// client-only PropertyCard this was split out of).
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-3 rounded-card border border-dashed border-hz-navy/15 px-4 py-10 text-center sm:max-w-none sm:px-6 sm:py-16">
      <Icon className="h-8 w-8 shrink-0 text-hz-navy/30" />
      <p className="font-medium text-hz-navy">{title}</p>
      <p className="max-w-sm text-sm text-hz-ink/60">{description}</p>
      {action}
    </div>
  );
}
