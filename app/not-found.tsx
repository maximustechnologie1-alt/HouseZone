import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-6xl font-bold text-hz-navy">404</p>
      <h1 className="text-xl font-semibold text-hz-navy">Page introuvable</h1>
      <p className="max-w-sm text-sm text-hz-ink/60">
        Ce bien n&apos;est plus disponible ou cette page n&apos;existe pas.
      </p>
      <Link href="/" className="flex items-center gap-2 rounded-full bg-hz-blue px-5 py-2.5 text-sm font-medium text-white">
        <Home className="h-4 w-4" /> Retour à l&apos;accueil
      </Link>
    </div>
  );
}
