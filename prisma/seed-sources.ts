import "dotenv/config";
import { prisma } from "../lib/prisma";

const SOURCES = [
  // ACTU
  { nom: "Le Monde",       url: "https://www.lemonde.fr/rss/une.xml",                    categorieSlug: "actu",            actif: true },
  { nom: "BFMTV",          url: "https://www.bfmtv.com/rss/news-24-7/",                  categorieSlug: "actu",            actif: true },
  { nom: "Franceinfo",     url: "https://www.francetvinfo.fr/titres.rss",                 categorieSlug: "actu",            actif: true },

  // SPORT
  { nom: "L'Équipe",       url: "https://www.lequipe.fr/rss/actu_rss.xml",               categorieSlug: "sport",           actif: true },
  { nom: "RMC Sport",      url: "https://rmcsport.bfmtv.com/rss/football/",              categorieSlug: "sport",           actif: true },
  { nom: "Eurosport",      url: "https://www.eurosport.fr/rss.xml",                      categorieSlug: "sport",           actif: true },

  // ÉCONOMIE
  { nom: "Les Échos",      url: "https://www.lesechos.fr/rss/rss_une.xml",               categorieSlug: "economie",        actif: true },
  { nom: "BFM Business",   url: "https://bfmbusiness.bfmtv.com/rss/bfmbusiness/",        categorieSlug: "economie",        actif: true },
  { nom: "Capital",        url: "https://www.capital.fr/rss",                            categorieSlug: "economie",        actif: true },

  // POLITIQUE
  { nom: "Le Figaro",      url: "https://www.lefigaro.fr/rss/figaro_politique.xml",      categorieSlug: "politique",       actif: true },
  { nom: "Libération",     url: "https://www.liberation.fr/arc/outboundfeeds/rss/",      categorieSlug: "politique",       actif: true },
  { nom: "Le Point",       url: "https://www.lepoint.fr/rss.xml",                        categorieSlug: "politique",       actif: true },

  // ANECDOTE
  { nom: "Konbini",        url: "https://www.konbini.com/fr/feed/",                      categorieSlug: "anecdote",        actif: true },
  { nom: "Brut",           url: "https://www.brut.media/fr/rss",                         categorieSlug: "anecdote",        actif: true },
  { nom: "20 Minutes",     url: "https://www.20minutes.fr/feeds/rss/societe.xml",        categorieSlug: "anecdote",        actif: true },

  // SUCCESS STORIES
  { nom: "Forbes France",  url: "https://www.forbes.fr/feed/",                           categorieSlug: "success-stories", actif: true },
  { nom: "Maddyness",      url: "https://www.maddyness.com/feed/",                       categorieSlug: "success-stories", actif: true },
  { nom: "Challenges",     url: "https://www.challenges.fr/rss.xml",                     categorieSlug: "success-stories", actif: true },
];

async function main() {
  console.log("🌱 Ajout des sources RSS...");

  for (const source of SOURCES) {
    const categorie = await prisma.categorie.findUnique({
      where: { slug: source.categorieSlug },
    });

    if (!categorie) {
      console.log(`  ⚠️  Catégorie introuvable: ${source.categorieSlug}`);
      continue;
    }

    await prisma.sourceBrute.upsert({
      where: { url: source.url },
      update: { nom: source.nom, actif: source.actif },
      create: {
        nom: source.nom,
        url: source.url,
        categorieId: categorie.id,
        actif: source.actif,
      },
    });

    console.log(`  ✓ ${source.nom} → ${source.categorieSlug}`);
  }

  console.log(`\n✅ ${SOURCES.length} sources RSS ajoutées !`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Erreur:", e);
  prisma.$disconnect();
  process.exit(1);
});
