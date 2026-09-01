import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { I18nProvider } from "@/lib/i18n/context";
import { getServerLocale } from "@/lib/i18n/get-locale";
import { getLocaleMeta } from "@/lib/i18n/locales";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "HouseZone — Trouvez votre prochain bien.",
    template: "%s · HouseZone",
  },
  description:
    "HouseZone est la plateforme immobilière du Burkina Faso : recherchez, vérifiez et visitez un bien en toute confiance.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "HouseZone", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#082B5C",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [locale, user] = await Promise.all([getServerLocale(), getCurrentUser()]);
  const dir = getLocaleMeta(locale).dir;

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-white text-hz-ink">
        <I18nProvider initialLocale={locale} isAuthenticated={Boolean(user)}>
          {children}
          <ServiceWorkerRegister />
        </I18nProvider>
      </body>
    </html>
  );
}
