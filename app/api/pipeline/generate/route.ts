import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { slugify } from "@/lib/slugify";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function fetchUnsplashImage(query: string): Promise<{ url: string; alt: string } | null> {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const photo = data.results?.[0];
    if (!photo) return null;
    return {
      url: photo.urls.regular,
      alt: photo.alt_description || query,
    };
  } catch {
    return null;
  }
}

const PROMPT_SYSTEM = `Tu es un journaliste professionnel pour le média Réalitte (France).
Tu rédiges des articles à partir de sources RSS.
Règles impératives :
- Rédige UNIQUEMENT à partir des faits fournis, sans inventer
- Ton neutre, factuel, clair et engagé
- Langue française, niveau journalistique
- Cite toujours la source
- Formate le contenu en HTML simple (balises p, h2, h3, blockquote uniquement)
- Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks`;

const PROMPT_USER = (source: { titreOriginal: string; contenuBrut: string; url: string }) => `
Source URL: ${source.url}
Titre original: ${source.titreOriginal}
Contenu brut: ${source.contenuBrut.slice(0, 3000)}

Génère un article complet en JSON avec cette structure exacte :
{
  "titre": "Titre accrocheur SEO (max 80 chars)",
  "chapo": "Chapô de 2 phrases max, résumé percutant",
  "contenu": "<p>Corps de l'article en HTML...</p>",
  "categorieSlug": "actu|sport|economie|politique|anecdote|success-stories",
  "sousCategorie": "Sous-catégorie précise ou null",
  "tags": ["tag1", "tag2", "tag3"],
  "metaTitle": "Meta titre SEO (max 60 chars)",
  "metaDescription": "Meta description (max 155 chars)"
}`;

export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const sources = await prisma.sourceBrute.findMany({
    where: { traite: false },
    take: 5,
    orderBy: { dateCollecte: "desc" },
  });

  if (sources.length === 0) {
    return NextResponse.json({ message: "Aucune source à traiter", generated: 0 });
  }

  let generated = 0;
  const errors: string[] = [];

  for (const source of sources) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: PROMPT_USER(source),
          },
        ],
        system: PROMPT_SYSTEM,
      });

      const rawText = response.content[0].type === "text" ? response.content[0].text : "";

      let parsed: {
        titre: string;
        chapo: string;
        contenu: string;
        categorieSlug: string;
        sousCategorie: string | null;
        tags: string[];
        metaTitle: string;
        metaDescription: string;
      };

      try {
        parsed = JSON.parse(rawText);
      } catch {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("JSON invalide dans la réponse Claude");
        parsed = JSON.parse(match[0]);
      }

      const categorie = await prisma.categorie.findUnique({
        where: { slug: parsed.categorieSlug || "actu" },
      });

      if (!categorie) {
        throw new Error(`Catégorie inconnue: ${parsed.categorieSlug}`);
      }

      const baseSlug = slugify(parsed.titre);
      let slug = baseSlug;
      let attempt = 0;
      while (await prisma.article.findUnique({ where: { slug } })) {
        attempt++;
        slug = `${baseSlug}-${attempt}`;
      }

      const wordCount = parsed.contenu.replace(/<[^>]+>/g, "").split(/\s+/).length;

      // Récupère l'image source depuis le JSON stocké lors de la collecte
      let sourceImageUrl: string | null = null;
      let sourceNom = "RSS";
      try {
        const data = JSON.parse(source.contenuBrut);
        sourceImageUrl = data.imageUrl || null;
        sourceNom = data.sourceNom || "RSS";
      } catch {
        // ancien format texte brut — pas d'image source
      }

      // Priorité : image du journal source → Unsplash en fallback
      let imageUrl: string | null = sourceImageUrl;
      let imageAlt: string | null = parsed.titre;
      if (!imageUrl) {
        const imageQuery = (parsed.tags?.[0] || parsed.titre).slice(0, 50);
        const unsplash = await fetchUnsplashImage(imageQuery);
        imageUrl = unsplash?.url || null;
        imageAlt = unsplash?.alt || parsed.titre;
      }

      await prisma.article.create({
        data: {
          titre: parsed.titre,
          slug,
          chapo: parsed.chapo,
          contenu: parsed.contenu,
          categorieId: categorie.id,
          sousCategorie: parsed.sousCategorie || null,
          tags: parsed.tags || [],
          sourceUrl: source.url,
          sourceNom,
          statut: "PENDING",
          metaTitle: parsed.metaTitle || null,
          metaDescription: parsed.metaDescription || null,
          tempsLecture: Math.max(1, Math.ceil(wordCount / 200)),
          imageUrl,
          imageAlt,
        },
      });

      await prisma.sourceBrute.update({
        where: { id: source.id },
        data: { traite: true },
      });

      generated++;
    } catch (err) {
      const msg = `Erreur génération source ${source.id}: ${err instanceof Error ? err.message : "inconnue"}`;
      errors.push(msg);
      console.error(msg);

      await prisma.sourceBrute.update({
        where: { id: source.id },
        data: { traite: true, erreur: msg.slice(0, 500) },
      });

      await prisma.pipelineLog.create({
        data: {
          type: "error",
          message: msg,
          metadata: { sourceId: source.id },
        },
      });
    }
  }

  await prisma.pipelineLog.create({
    data: {
      type: "generate",
      message: `Génération terminée: ${generated} articles créés`,
      metadata: { generated, errors },
    },
  });

  return NextResponse.json({ generated, errors });
}
