import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Google News ne consomme que les articles des 2 derniers jours
export const revalidate = 300;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com").replace(/\/$/, "");

function escXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  const articles = await prisma.article.findMany({
    where: {
      statut: "PUBLISHED",
      datePublication: { gte: twoDaysAgo },
    },
    include: { categorie: true },
    orderBy: { datePublication: "desc" },
    take: 1000,
  });

  const urls = articles
    .map((a) => {
      const url = `${SITE_URL}/${a.categorie.slug}/${a.slug}`;
      const pubDate = (a.datePublication ?? a.dateCreation).toISOString();
      return `
  <url>
    <loc>${url}</loc>
    <news:news>
      <news:publication>
        <news:name>Réalitte</news:name>
        <news:language>fr</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escXml(a.titre)}</news:title>
    </news:news>
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
