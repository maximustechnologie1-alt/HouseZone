import { Bell } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/listings/property-card";
import { NotificationItem } from "@/components/notifications/notification-item";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser("/notifications");
  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="hz-container max-w-2xl py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-hz-navy">Notifications</h1>
        <MarkAllReadButton />
      </div>
      <div className="mt-6 space-y-2">
        {!notifications || notifications.length === 0 ? (
          <EmptyState icon={Bell} title="Aucune notification" description="Vous êtes à jour !" />
        ) : (
          notifications.map((n) => <NotificationItem key={n.id} notification={n} />)
        )}
      </div>
    </div>
  );
}
