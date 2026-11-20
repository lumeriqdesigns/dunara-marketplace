import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = brand.url.replace(/\/$/, "");
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/explore`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/locations`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/how-it-works`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/safety`, changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    const supabase = await createClient();
    const [{ data: categories }, { data: shops }, { data: listings }] = await Promise.all([
      supabase.from("categories").select("slug, updated_at:created_at"),
      supabase
        .from("shops")
        .select("slug, updated_at")
        .eq("is_published", true)
        .eq("is_suspended", false),
      supabase
        .from("listings")
        .select("slug, updated_at, shops!inner(slug, is_published, is_suspended)")
        .eq("is_published", true)
        .eq("shops.is_published", true)
        .eq("shops.is_suspended", false)
        .limit(5000),
    ]);

    const catEntries =
      categories?.map((c) => ({
        url: `${base}/categories/${c.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })) ?? [];

    const shopEntries =
      shops?.map((s) => ({
        url: `${base}/shop/${s.slug}`,
        lastModified: s.updated_at ? new Date(s.updated_at) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })) ?? [];

    const listingEntries =
      (listings as { slug: string; updated_at: string; shops: { slug: string } }[] | null)?.map(
        (l) => ({
          url: `${base}/listing/${l.shops.slug}/${l.slug}`,
          lastModified: l.updated_at ? new Date(l.updated_at) : undefined,
          changeFrequency: "weekly" as const,
          priority: 0.75,
        })
      ) ?? [];

    return [...staticRoutes, ...catEntries, ...shopEntries, ...listingEntries];
  } catch {
    return staticRoutes;
  }
}
