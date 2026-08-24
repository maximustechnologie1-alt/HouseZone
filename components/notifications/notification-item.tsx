"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn, relativeTime } from "@/lib/utils";
import { markNotificationReadAction } from "@/lib/actions/notifications";
import type { Notification } from "@/lib/types/database";

export function NotificationItem({ notification }: { notification: Notification }) {
  const [, startTransition] = useTransition();
  const router = useRouter();

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 rounded-card border p-4",
        notification.is_read ? "border-hz-navy/10 bg-white" : "border-hz-blue/30 bg-hz-sky/50"
      )}
    >
      <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", notification.is_read ? "bg-transparent" : "bg-hz-gold")} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-hz-navy">{notification.title}</p>
        {notification.body && <p className="mt-0.5 text-sm text-hz-ink/70">{notification.body}</p>}
        <p className="mt-1 text-xs text-hz-ink/40">{relativeTime(notification.created_at)}</p>
      </div>
    </div>
  );

  function handleClick() {
    if (!notification.is_read) {
      startTransition(async () => {
        await markNotificationReadAction(notification.id);
        router.refresh();
      });
    }
  }

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={handleClick} className="block">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleClick} className="block w-full text-left">
      {content}
    </button>
  );
}
