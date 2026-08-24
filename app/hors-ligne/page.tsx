import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-hz-sky px-6 text-center">
      <WifiOff className="h-10 w-10 text-hz-navy" />
      <h1 className="text-xl font-semibold text-hz-navy">Pas de connexion</h1>
      <p className="max-w-sm text-sm text-hz-ink/70">
        HouseZone a besoin d&apos;une connexion internet pour charger cette page. Vérifiez votre connexion et
        réessayez.
      </p>
    </div>
  );
}
