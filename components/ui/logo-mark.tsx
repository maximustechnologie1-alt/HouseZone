import Image from "next/image";

// HouseZone brand mark — the real app logo (public/logo.png), also used for
// the favicon and PWA icons (app/icon.png, app/apple-icon.png).
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="HouseZone"
      width={size}
      height={size}
      className={`shrink-0 rounded-[22%] ${className ?? ""}`}
      priority
    />
  );
}

// Wordmark texte « HOUSEZONE » — HOUSE en navy, ZONE en blue, capitales.
// Séparé de LogoMark pour rester réutilisable (header, drawer, auth, hôte).
export function Wordmark({
  className,
  variant = "navy",
}: {
  className?: string;
  variant?: "navy" | "light";
}) {
  return (
    <span
      className={`text-lg font-bold uppercase tracking-tight ${
        variant === "light" ? "text-white" : "text-hz-navy"
      } ${className ?? ""}`}
    >
      House<span className={variant === "light" ? "text-hz-sky" : "text-hz-blue"}>zone</span>
    </span>
  );
}
