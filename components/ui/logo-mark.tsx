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
