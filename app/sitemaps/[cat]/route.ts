import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 600;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com").replace(/\/$/, "");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cat: string }> }
) {
  const { cat } = await params;

  const categorie = await prisma.categorie.findUnique({ where: { slug: cat } });
  if (!categorie) {
    return new NextResponse("Catégorie introuvable", { status: 404 });
  }

  const articles = await prisma.article.findMany({
    where: { statut: "PUBLISHED", categorieId: categorie.id },
    select: { slug: true, datePublication: true, dateCreation: true },
    orderBy: { datePublication: "desc" },
    take: 50000,
  });

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const urls = articles
    .map((a) => {
      const date = (a.datePublication ?? a.dateCreation).toISOString();
      const isRecent = (a.datePublication ?? a.dateCreation) > sevenDaysAgo;
      return `
  <url>
    <loc>${SITE_URL}/${cat}/${a.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${isRecent ? "daily" : "weekly"}</changefreq>
    <priority>${isRecent ? "0.8" : "0.6"}</priority>
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
