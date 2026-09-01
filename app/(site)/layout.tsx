import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { NavDrawerProvider } from "@/components/layout/nav-drawer-context";
import { getCurrentUser } from "@/lib/auth";
import { getUnreadMessageCount } from "@/lib/data/messages";
import { getLanguages } from "@/lib/data/languages";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  const isHost = user?.role === "host";
  const [unreadMessages, languages] = await Promise.all([
    user ? getUnreadMessageCount(user.id) : Promise.resolve(0),
    getLanguages(),
  ]);
  const messagesHref = isHost ? "/espace-hote/messages" : "/messages";

  return (
    <NavDrawerProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
        <SiteFooter />
        <MobileBottomNav messagesHref={messagesHref} unreadMessages={unreadMessages} />
        <MobileDrawer user={user} isHost={isHost} languages={languages} />
      </div>
    </NavDrawerProvider>
  );
}
