import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { getCurrentUser } from "@/lib/auth";
import { getUnreadMessageCount } from "@/lib/data/messages";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  const unreadMessages = user ? await getUnreadMessageCount(user.id) : 0;
  const messagesHref = user?.role === "host" ? "/espace-hote/messages" : "/messages";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <SiteFooter />
      <MobileBottomNav messagesHref={messagesHref} unreadMessages={unreadMessages} />
    </div>
  );
}
