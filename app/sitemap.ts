import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.fr";

  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where: { statut: "PUBLISHED" },
      select: { slug: true, datePublication: true, categorie: { select: { slug: true } } },
      orderBy: { datePublication: "desc" },
    }),
    prisma.categorie.findMany({ select: { slug: true } }),
  ]);

  const staticPages = [
    { url: siteUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${siteUrl}/a-propos`, lastModified: new Date(), priority: 0.5 },
    { url: `${siteUrl}/newsletter`, lastModified: new Date(), priority: 0.4 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), priority: 0.3 },
  ];

  const categoryPages = categories.map((cat) => ({
    url: `${siteUrl}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  const articlePages = articles.map((a) => ({
    url: `${siteUrl}/${a.categorie.slug}/${a.slug}`,
    lastModified: a.datePublication || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...articlePages];
}
