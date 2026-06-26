import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com").replace(/\/$/, "");

export async function GET() {
  const categories = await prisma.categorie.findMany({
    select: { slug: true },
    orderBy: { ordre: "asc" },
  });

  const sitemaps = [
    { url: `${SITE_URL}/sitemap.xml`, label: "Principal" },
    { url: `${SITE_URL}/news-sitemap.xml`, label: "Google News" },
    ...categories.map((c) => ({
      url: `${SITE_URL}/sitemaps/${c.slug}`,
      label: c.slug,
    })),
  ];

  const urls = sitemaps
    .map(({ url }) => `\n  <sitemap><loc>${url}</loc><lastmod>${new Date().toISOString()}</lastmod></sitemap>`)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
