import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { slugify } from "@/lib/slugify";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
    return { url: photo.urls.regular, alt: photo.alt_description || query };
  } catch { return null; }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { sujet, categorieSlugHint } = await req.json();
  if (!sujet?.trim()) {
    return NextResponse.json({ error: "Sujet requis" }, { status: 400 });
  }

  const prompt = `Tu es un journaliste professionnel pour le média Réalitte (France).
Rédige un article complet et original sur le sujet suivant : "${sujet}"

Règles :
- Contenu factuel, bien documenté, ton journalistique engagé
- Longueur : 400 à 600 mots dans le corps de l'article
- Formate le contenu en HTML simple (balises p, h2, h3, blockquote uniquement)
- Langue française impeccable
- Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks

Structure JSON exacte :
{
  "titre": "Titre accrocheur SEO (max 80 chars)",
  "chapo": "Chapô de 2 phrases max, résumé percutant",
  "contenu": "<p>Corps de l'article en HTML...</p><h2>Sous-titre</h2><p>...</p>",
  "categorieSlug": "${categorieSlugHint || "actu|sport|economie|politique|anecdote|success-stories"}",
  "sousCategorie": "Sous-catégorie précise ou null",
  "tags": ["tag1", "tag2", "tag3"],
  "metaTitle": "Meta titre SEO (max 60 chars)",
  "metaDescription": "Meta description (max 155 chars)"
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (response.content[0] as { type: string; text: string }).text.trim();
    const jsonStr = raw.startsWith("{") ? raw : raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const parsed = JSON.parse(jsonStr);

    const categorie = await prisma.categorie.findFirst({
      where: { slug: parsed.categorieSlug },
    });
    if (!categorie) {
      return NextResponse.json({ error: `Catégorie "${parsed.categorieSlug}" introuvable en base` }, { status: 400 });
    }

    const baseSlug = slugify(parsed.titre);
    let slug = baseSlug;
    let attempt = 0;
    while (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++attempt}`;
    }

    const wordCount = parsed.contenu.replace(/<[^>]+>/g, "").split(/\s+/).length;
    const imageQuery = (parsed.tags?.[0] || sujet).slice(0, 50);
    const image = await fetchUnsplashImage(imageQuery);

    const article = await prisma.article.create({
      data: {
        titre: parsed.titre,
        slug,
        chapo: parsed.chapo,
        contenu: parsed.contenu,
        categorieId: categorie.id,
        sousCategorie: parsed.sousCategorie || null,
        tags: parsed.tags || [],
        sourceUrl: "https://www.realitte.com",
        sourceNom: "Réalitte",
        statut: "PENDING",
        metaTitle: parsed.metaTitle || null,
        metaDescription: parsed.metaDescription || null,
        tempsLecture: Math.max(1, Math.ceil(wordCount / 200)),
        imageUrl: image?.url || null,
        imageAlt: image?.alt || sujet,
      },
    });

    return NextResponse.json({ articleId: article.id, titre: article.titre, slug: article.slug });
  } catch (e) {
    console.error("generate-custom error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur" }, { status: 500 });
  }
}
