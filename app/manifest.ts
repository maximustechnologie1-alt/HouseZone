import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HouseZone — Trouvez votre prochain bien.",
    short_name: "HouseZone",
    description: "Plateforme immobilière du Burkina Faso : recherchez, vérifiez, visitez.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#082B5C",
    lang: "fr",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
