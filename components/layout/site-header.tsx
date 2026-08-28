import Link from "next/link";
import { Bell } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LogoMark } from "@/components/ui/logo-mark";
import { MainMenu } from "@/components/layout/main-menu";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const isHost = user?.role === "host";

  let unreadCount = 0;
  if (user) {
    const supabase = await createClient();
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    unreadCount = count ?? 0;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-hz-navy/10 bg-white/95 backdrop-blur">
      <div className="hz-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <LogoMark size={36} />
          <span className="hidden text-lg font-semibold text-hz-navy sm:inline">HouseZone</span>
        </Link>

        <div className="flex items-center gap-1">
          {user && (
            <Link
              href="/notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-hz-navy hover:bg-hz-sky"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-hz-gold" />}
            </Link>
          )}
          <MainMenu user={user} isHost={isHost} />
        </div>
      </div>
    </header>
  );
}
