import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Parser from "rss-parser";

const RSS_SOURCES = [
  // ── Actu générale ─────────────────────────────────────────
  { url: "https://www.lemonde.fr/rss/une.xml",                          nom: "Le Monde",              categorie: "actu", sousCategorie: null },
  { url: "https://www.bfmtv.com/rss/news-24-7/",                        nom: "BFMTV",                 categorie: "actu", sousCategorie: null },
  { url: "https://www.francetvinfo.fr/titres.rss",                       nom: "Franceinfo",            categorie: "actu", sousCategorie: null },
  { url: "https://www.lefigaro.fr/rss/figaro_actualites.xml",            nom: "Le Figaro",             categorie: "actu", sousCategorie: null },
  { url: "https://www.20minutes.fr/feeds/rss/une.xml",                   nom: "20 Minutes",            categorie: "actu", sousCategorie: null },
  { url: "https://www.leparisien.fr/rss.xml",                            nom: "Le Parisien",           categorie: "actu", sousCategorie: null },
  { url: "https://www.liberation.fr/arc/outboundfeeds/rss/",             nom: "Libération",            categorie: "actu", sousCategorie: null },
  { url: "https://www.lexpress.fr/rss/alaune.xml",                       nom: "L'Express",             categorie: "actu", sousCategorie: null },
  { url: "https://www.lepoint.fr/rss.xml",                               nom: "Le Point",              categorie: "actu", sousCategorie: null },

  // ── Sport ─────────────────────────────────────────────────
  { url: "https://www.lequipe.fr/rss/actu_rss.xml",                      nom: "L'Équipe",              categorie: "sport", sousCategorie: null },
  { url: "https://rmcsport.bfmtv.com/rss/football/",                     nom: "RMC Sport",             categorie: "sport", sousCategorie: null },
  { url: "https://www.eurosport.fr/rss.xml",                             nom: "Eurosport",             categorie: "sport", sousCategorie: null },
  { url: "https://www.goal.com/feeds/fr/news",                           nom: "Goal France",           categorie: "sport", sousCategorie: null },
  { url: "https://www.rugbyrama.fr/rss/actu_rss_feed.xml",              nom: "Rugbyrama",             categorie: "sport", sousCategorie: null },

  // ── Politique ─────────────────────────────────────────────
  { url: "https://www.lefigaro.fr/rss/figaro_politique.xml",             nom: "Le Figaro Politique",   categorie: "politique", sousCategorie: null },
  { url: "https://www.publicsenat.fr/rss/actualite.xml",                 nom: "Public Sénat",          categorie: "politique", sousCategorie: null },
  { url: "https://www.francetvinfo.fr/politique.rss",                    nom: "Franceinfo Politique",  categorie: "politique", sousCategorie: null },
  { url: "https://www.lemonde.fr/politique/rss_full.xml",                nom: "Le Monde Politique",    categorie: "politique", sousCategorie: null },

  // ── Économie → Actu ───────────────────────────────────────
  { url: "https://www.lesechos.fr/rss/rss_une.xml",                      nom: "Les Échos",             categorie: "actu", sousCategorie: "Économie" },
  { url: "https://bfmbusiness.bfmtv.com/rss/bfmbusiness/",               nom: "BFM Business",          categorie: "actu", sousCategorie: "Économie" },
  { url: "https://www.latribune.fr/rss/une.xml",                         nom: "La Tribune",            categorie: "actu", sousCategorie: "Économie" },
  { url: "https://www.challenges.fr/rss.xml",                            nom: "Challenges",            categorie: "actu", sousCategorie: "Économie" },
  { url: "https://www.capital.fr/rss",                                   nom: "Capital",               categorie: "actu", sousCategorie: "Économie" },

  // ── Success Stories → Actu ────────────────────────────────
  { url: "https://www.forbes.fr/feed/",                                  nom: "Forbes France",         categorie: "actu", sousCategorie: "Success Stories" },
  { url: "https://www.maddyness.com/feed/",                              nom: "Maddyness",             categorie: "actu", sousCategorie: "Success Stories" },
  { url: "https://www.frenchweb.fr/feed",                                nom: "FrenchWeb",             categorie: "actu", sousCategorie: "Success Stories" },
  { url: "https://www.journaldunet.com/rss/",                            nom: "Journal du Net",        categorie: "actu", sousCategorie: "Success Stories" },

  // ── People → Actu ─────────────────────────────────────────
  { url: "https://www.purepeople.com/rss/news_gf-1_l-0_c-0.xml",        nom: "PurePeople",            categorie: "actu", sousCategorie: "People" },
  { url: "https://www.gala.fr/rss/actualites.xml",                       nom: "Gala",                  categorie: "actu", sousCategorie: "People" },
  { url: "https://www.closermag.fr/feed",                                nom: "Closer",                categorie: "actu", sousCategorie: "People" },
  { url: "https://www.voici.fr/feed/",                                   nom: "Voici",                 categorie: "actu", sousCategorie: "People" },
  { url: "https://www.public.fr/feed/rss",                               nom: "Public.fr",             categorie: "actu", sousCategorie: "People" },

  // ── Santé & Beauté → Actu ─────────────────────────────────
  { url: "https://www.doctissimo.fr/rss/sante.xml",                      nom: "Doctissimo Santé",      categorie: "actu", sousCategorie: "Santé & Beauté" },
  { url: "https://www.sante-magazine.fr/feed",                           nom: "Santé Magazine",        categorie: "actu", sousCategorie: "Santé & Beauté" },
  { url: "https://www.elle.fr/Beaute/rss.xml",                           nom: "Elle Beauté",           categorie: "actu", sousCategorie: "Santé & Beauté" },
  { url: "https://www.topsante.com/rss/rss.xml",                         nom: "Top Santé",             categorie: "actu", sousCategorie: "Santé & Beauté" },
  { url: "https://www.femmeactuelle.fr/sante/rss.xml",                   nom: "Femme Actuelle Santé",  categorie: "actu", sousCategorie: "Santé & Beauté" },

  // ── Fait Divers → Actu ────────────────────────────────────
  { url: "https://www.leparisien.fr/faits-divers/rss.xml",               nom: "Le Parisien FD",        categorie: "actu", sousCategorie: "Fait Divers" },
  { url: "https://www.20minutes.fr/feeds/rss/faits-divers.xml",          nom: "20 Minutes FD",         categorie: "actu", sousCategorie: "Fait Divers" },
  { url: "https://www.bfmtv.com/police-justice/rss/",                    nom: "BFMTV Police",          categorie: "actu", sousCategorie: "Fait Divers" },
  { url: "https://www.lefigaro.fr/rss/figaro_faits-divers.xml",          nom: "Le Figaro FD",          categorie: "actu", sousCategorie: "Fait Divers" },

  // ── Créateurs de contenu ─────────────────────────────────
  // Sources très ciblées créateurs (YouTube, TikTok, streaming, influenceurs)
  { url: "https://www.tubefilter.com/feed/",                             nom: "Tubefilter",            categorie: "createurs", sousCategorie: "YouTube" },
  { url: "https://www.socialmediatoday.com/rss.xml",                     nom: "Social Media Today",    categorie: "createurs", sousCategorie: "Réseaux Sociaux" },
  { url: "https://influencermarketinghub.com/feed/",                     nom: "Influencer Marketing Hub", categorie: "createurs", sousCategorie: "Réseaux Sociaux" },
  { url: "https://www.theverge.com/rss/index.xml",                       nom: "The Verge",             categorie: "createurs", sousCategorie: "Tech & Créa" },
  { url: "https://variety.com/v/digital/feed/",                          nom: "Variety Digital",       categorie: "createurs", sousCategorie: "Streaming" },
  { url: "https://deadline.com/category/digital/feed/",                  nom: "Deadline Digital",      categorie: "createurs", sousCategorie: "Streaming" },
  // Sources françaises avec contenu créateurs
  { url: "https://www.melty.fr/rss.xml",                                 nom: "Melty",                 categorie: "createurs", sousCategorie: null },
  { url: "https://www.konbini.com/fr/feed/",                             nom: "Konbini",               categorie: "createurs", sousCategorie: null },
  { url: "https://www.purebreak.com/rss.xml",                            nom: "Purebreak",             categorie: "createurs", sousCategorie: null },
  { url: "https://www.numerama.com/feed/",                               nom: "Numerama",              categorie: "createurs", sousCategorie: "Tech & Créa" },
  { url: "https://siecledigital.fr/feed/",                               nom: "Siècle Digital",        categorie: "createurs", sousCategorie: "Tech & Créa" },
  { url: "https://www.creapills.com/feed",                               nom: "Creapills",             categorie: "createurs", sousCategorie: "Tech & Créa" },
  { url: "https://www.madmoizelle.com/feed",                             nom: "Madmoizelle",           categorie: "createurs", sousCategorie: null },

  // ── International (traduit par Claude) ───────────────────
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml",                  nom: "BBC World",             categorie: "actu", sousCategorie: null },
  { url: "https://www.theguardian.com/world/rss",                        nom: "The Guardian",          categorie: "actu", sousCategorie: null },
  { url: "https://feeds.reuters.com/reuters/topNews",                    nom: "Reuters",               categorie: "actu", sousCategorie: null },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",       nom: "New York Times",        categorie: "actu", sousCategorie: null },
  { url: "https://feeds.bbci.co.uk/sport/rss.xml",                       nom: "BBC Sport",             categorie: "sport", sousCategorie: null },
  { url: "https://techcrunch.com/feed/",                                 nom: "TechCrunch",            categorie: "actu", sousCategorie: "Success Stories" },
  { url: "https://feeds.bloomberg.com/markets/news.rss",                 nom: "Bloomberg Markets",     categorie: "actu", sousCategorie: "Économie" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml",                    nom: "Al Jazeera",            categorie: "actu", sousCategorie: null },
  // Afrique francophone
  { url: "https://www.jeuneafrique.com/feed/",                           nom: "Jeune Afrique",         categorie: "actu", sousCategorie: null },
  { url: "https://www.rfi.fr/fr/rss",                                    nom: "RFI",                   categorie: "actu", sousCategorie: null },
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

        await prisma.sourceBrute.create({
          data: {
            url: item.link,
            titreOriginal: item.title,
            categorie: source.categorie,
            contenuBrut: JSON.stringify({
              title: item.title,
              description: item.contentSnippet || item.summary || "",
              content: item.content || "",
              imageUrl: sourceImage,
              sourceNom: source.nom,
              sousCategorie: source.sousCategorie || null,
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
