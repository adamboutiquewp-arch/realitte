import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 600;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com").replace(/\/$/, "");

// Pages statiques hors catégories — priorité décroissante
const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: SITE_URL,                             lastModified: new Date(), changeFrequency: "hourly",  priority: 1.0 },
  { url: `${SITE_URL}/explorer`,               lastModified: new Date(), changeFrequency: "daily",   priority: 0.6 },
  { url: `${SITE_URL}/partenaires`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 0.5 },
  { url: `${SITE_URL}/entrepreneurs`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.5 },
  { url: `${SITE_URL}/newsletter`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${SITE_URL}/a-propos`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${SITE_URL}/contact`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  { url: `${SITE_URL}/cgu`,                    lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
  { url: `${SITE_URL}/confidentialite`,        lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [categories, articlesWithTags, articles] = await Promise.all([
      // Toutes les catégories depuis la DB (pas hardcodées)
      prisma.categorie.findMany({
        select: { slug: true },
        orderBy: { ordre: "asc" },
      }),

      // Tags uniques pour générer les pages /tag/[tag]
      prisma.article.findMany({
        where: { statut: "PUBLISHED" },
        select: { tags: true, datePublication: true },
      }),

      // Tous les articles publiés
      prisma.article.findMany({
        where: { statut: "PUBLISHED" },
        select: {
          slug: true,
          datePublication: true,
          dateCreation: true,
          categorie: { select: { slug: true } },
        },
        orderBy: { datePublication: "desc" },
        take: 10000,
      }),
    ]);

    // Pages catégories — toutes depuis la DB, priorité haute
    const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${SITE_URL}/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.9,
    }));

    // Pages tags — 1 page par tag, avec la date du dernier article
    const tagMap = new Map<string, Date>();
    for (const a of articlesWithTags) {
      const pubDate = a.datePublication || new Date();
      for (const tag of a.tags) {
        const existing = tagMap.get(tag);
        if (!existing || pubDate > existing) tagMap.set(tag, pubDate);
      }
    }
    const tagPages: MetadataRoute.Sitemap = Array.from(tagMap.entries()).map(([tag, date]) => ({
      url: `${SITE_URL}/tag/${encodeURIComponent(tag)}`,
      lastModified: date,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

    // Pages articles
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const articlePages: MetadataRoute.Sitemap = articles.map((a) => {
      const pubDate = a.datePublication ?? a.dateCreation;
      const isRecent = pubDate > sevenDaysAgo;
      return {
        url: `${SITE_URL}/${a.categorie.slug}/${a.slug}`,
        lastModified: pubDate,
        changeFrequency: isRecent ? ("daily" as const) : ("weekly" as const),
        priority: isRecent ? 0.8 : 0.6,
      };
    });

    return [
      ...STATIC_PAGES,
      ...categoryPages,
      ...tagPages,
      ...articlePages,
    ];
  } catch {
    return STATIC_PAGES;
  }
}
