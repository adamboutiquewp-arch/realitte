import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 600;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com").replace(/\/$/, "");

function escXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { statut: "PUBLISHED" },
    include: { categorie: true },
    orderBy: { datePublication: "desc" },
    take: 50,
  });

  const items = articles
    .map((a) => {
      const url = `${SITE_URL}/${a.categorie.slug}/${a.slug}`;
      const pubDate = (a.datePublication ?? a.dateCreation).toUTCString();
      return `
    <item>
      <title><![CDATA[${a.titre}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${stripHtml(a.chapo)}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${a.categorie.nom}]]></category>
      ${a.imageUrl ? `<media:content url="${escXml(a.imageUrl)}" medium="image" />` : ""}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Réalitte — Le vrai. Le brut. Le mérité.</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Le média de ceux qui veulent comprendre le monde et ceux qui le changent.</description>
    <language>fr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <image>
      <url>${SITE_URL}/logo.png</url>
      <title>Réalitte</title>
      <link>${SITE_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
