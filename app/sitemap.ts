import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.fr";

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${siteUrl}/actu`, lastModified: new Date(), priority: 0.8 },
    { url: `${siteUrl}/sport`, lastModified: new Date(), priority: 0.8 },
    { url: `${siteUrl}/economie`, lastModified: new Date(), priority: 0.8 },
    { url: `${siteUrl}/politique`, lastModified: new Date(), priority: 0.8 },
    { url: `${siteUrl}/success-stories`, lastModified: new Date(), priority: 0.8 },
    { url: `${siteUrl}/people`,          lastModified: new Date(), priority: 0.8 },
    { url: `${siteUrl}/sante-beaute`,    lastModified: new Date(), priority: 0.8 },
    { url: `${siteUrl}/fait-divers`,     lastModified: new Date(), priority: 0.8 },
    { url: `${siteUrl}/a-propos`, lastModified: new Date(), priority: 0.5 },
    { url: `${siteUrl}/newsletter`, lastModified: new Date(), priority: 0.4 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), priority: 0.3 },
  ];

  try {
    const articles = await prisma.article.findMany({
      where: { statut: "PUBLISHED" },
      include: { categorie: { select: { slug: true } } },
      orderBy: { datePublication: "desc" },
      take: 1000,
    });

    const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${siteUrl}/${a.categorie.slug}/${a.slug}`,
      lastModified: a.datePublication || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...articlePages];
  } catch {
    return staticPages;
  }
}
