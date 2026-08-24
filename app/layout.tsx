import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-white text-hz-ink">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
