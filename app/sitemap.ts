import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.fr").replace(/\/$/, "");

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: SITE_URL,                          lastModified: new Date(), changeFrequency: "hourly",  priority: 1.0 },
  { url: `${SITE_URL}/actu`,               lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
  { url: `${SITE_URL}/sport`,              lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
  { url: `${SITE_URL}/politique`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
  { url: `${SITE_URL}/createurs`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
  { url: `${SITE_URL}/entrepreneurs`,      lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
  { url: `${SITE_URL}/a-propos`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${SITE_URL}/newsletter`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  { url: `${SITE_URL}/contact`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const articles = await prisma.article.findMany({
      where: { statut: "PUBLISHED" },
      select: {
        slug: true,
        datePublication: true,
        dateCreation: true,
        categorie: { select: { slug: true } },
      },
      orderBy: { datePublication: "desc" },
      take: 10000,
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const articlePages: MetadataRoute.Sitemap = articles.map((a) => {
      const pubDate = a.datePublication || a.dateCreation;
      const isRecent = pubDate > sevenDaysAgo;
      return {
        url: `${SITE_URL}/${a.categorie.slug}/${a.slug}`,
        lastModified: pubDate,
        changeFrequency: isRecent ? ("daily" as const) : ("weekly" as const),
        priority: isRecent ? 0.8 : 0.6,
      };
    });

    return [...STATIC_PAGES, ...articlePages];
  } catch {
    return STATIC_PAGES;
  }
}
