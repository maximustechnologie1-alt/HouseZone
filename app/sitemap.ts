import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/recherche`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/devenir-hote`, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const supabase = await createClient();
    const { data: listings } = await supabase
      .from("listings")
      .select("id,updated_at")
      .eq("status", "active")
      .limit(1000);

    const listingRoutes: MetadataRoute.Sitemap = (listings ?? []).map((l) => ({
      url: `${base}/biens/${l.id}`,
      lastModified: l.updated_at,
      changeFrequency: "daily",
      priority: 0.6,
    }));

    return [...staticRoutes, ...listingRoutes];
  } catch {
    return staticRoutes;
  }
}
