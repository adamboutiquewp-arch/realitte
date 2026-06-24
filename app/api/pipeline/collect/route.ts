import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Parser from "rss-parser";

const RSS_SOURCES = [
  { url: "https://www.lemonde.fr/rss/une.xml",           nom: "Le Monde" },
  { url: "https://www.lequipe.fr/rss/home_une.xml",      nom: "L'Équipe" },
  { url: "https://www.lesechos.fr/rss/rss_une.xml",      nom: "Les Échos" },
  { url: "https://www.bfmtv.com/rss/news-24-7/",         nom: "BFMTV" },
  { url: "https://feeds.bbci.co.uk/french/rss.xml",      nom: "BBC Afrique" },
];

const parser = new Parser({ timeout: 10000 });

export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let collected = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);

      for (const item of feed.items.slice(0, 10)) {
        if (!item.link || !item.title) continue;

        const existing = await prisma.sourceBrute.findFirst({
          where: { url: item.link },
        });

        if (existing) {
          skipped++;
          continue;
        }

        await prisma.sourceBrute.create({
          data: {
            url: item.link,
            titreOriginal: item.title,
            contenuBrut: [
              item.title,
              item.contentSnippet || item.summary || "",
              item.content || "",
            ]
              .filter(Boolean)
              .join("\n\n"),
            traite: false,
          },
        });
        collected++;
      }
    } catch (err) {
      const msg = `Erreur ${source.nom}: ${err instanceof Error ? err.message : "inconnue"}`;
      errors.push(msg);
      console.error(msg);
    }
  }

  await prisma.pipelineLog.create({
    data: {
      type: "collect",
      message: `Collecte terminée: ${collected} nouvelles sources, ${skipped} doublons`,
      metadata: { collected, skipped, errors },
    },
  });

  return NextResponse.json({ collected, skipped, errors });
}
