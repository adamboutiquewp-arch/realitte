import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Parser from "rss-parser";

const RSS_SOURCES = [
  // Actu générale
  { url: "https://www.lemonde.fr/rss/une.xml",                      nom: "Le Monde",           categorie: "actu" },
  { url: "https://www.bfmtv.com/rss/news-24-7/",                    nom: "BFMTV",              categorie: "actu" },
  { url: "https://www.francetvinfo.fr/titres.rss",                   nom: "Franceinfo",         categorie: "actu" },
  // Sport
  { url: "https://www.lequipe.fr/rss/actu_rss.xml",                 nom: "L'Équipe",           categorie: "sport" },
  { url: "https://rmcsport.bfmtv.com/rss/football/",                nom: "RMC Sport",          categorie: "sport" },
  // Économie
  { url: "https://www.lesechos.fr/rss/rss_une.xml",                 nom: "Les Échos",          categorie: "economie" },
  { url: "https://bfmbusiness.bfmtv.com/rss/bfmbusiness/",          nom: "BFM Business",       categorie: "economie" },
  // Politique
  { url: "https://www.lefigaro.fr/rss/figaro_politique.xml",        nom: "Le Figaro Politique", categorie: "politique" },
  // Anecdote / Société
  { url: "https://www.20minutes.fr/feeds/rss/societe.xml",          nom: "20 Minutes Société", categorie: "anecdote" },
  { url: "https://feeds.bbci.co.uk/french/rss.xml",                 nom: "BBC Afrique",        categorie: "anecdote" },
  // Success Stories / Entrepreneuriat
  { url: "https://www.forbes.fr/feed/",                             nom: "Forbes France",      categorie: "success-stories" },
  { url: "https://www.maddyness.com/feed/",                         nom: "Maddyness",          categorie: "success-stories" },
];

// Configure le parser pour extraire les images des flux RSS
type CustomItem = {
  mediaContent?: { $?: { url?: string } };
  mediaThumbnail?: { $?: { url?: string } };
  "media:content"?: { $?: { url?: string } };
  "media:thumbnail"?: { $?: { url?: string } };
};

const parser = new Parser<Record<string, unknown>, CustomItem>({
  timeout: 10000,
  customFields: {
    item: [
      ["media:content",   "mediaContent",   { keepArray: false }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
    ],
  },
});

function extractSourceImage(item: Parser.Item & CustomItem): string | null {
  // 1. enclosure (standard RSS)
  if (item.enclosure?.url) return item.enclosure.url;
  // 2. media:content (common in news feeds)
  const mc = item.mediaContent || item["media:content"];
  if (mc?.$?.url) return mc.$.url;
  // 3. media:thumbnail
  const mt = item.mediaThumbnail || item["media:thumbnail"];
  if (mt?.$?.url) return mt.$.url;
  // 4. Try to extract from content/description HTML
  const html = item.content || item.summary || "";
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) return imgMatch[1];
  return null;
}

export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Filtre par catégories si spécifiées (?categories=sport,politique)
  const catsParam = req.nextUrl.searchParams.get("categories");
  const selectedCats = catsParam ? catsParam.split(",").map((c) => c.trim()) : [];
  const sources = selectedCats.length > 0
    ? RSS_SOURCES.filter((s) => selectedCats.includes(s.categorie))
    : RSS_SOURCES;

  let collected = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const source of sources) {
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

        const sourceImage = extractSourceImage(item as Parser.Item & CustomItem);

        // Stocke les données en JSON pour récupérer l'image dans generate
        await prisma.sourceBrute.create({
          data: {
            url: item.link,
            titreOriginal: item.title,
            contenuBrut: JSON.stringify({
              title: item.title,
              description: item.contentSnippet || item.summary || "",
              content: item.content || "",
              imageUrl: sourceImage,
              sourceNom: source.nom,
            }),
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
