import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { slugify } from "@/lib/slugify";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function searchWeb(query: string): Promise<string> {
  const key = process.env.SERPER_API_KEY;
  if (!key) return "";
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": key, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, num: 6, gl: "fr", hl: "fr" }),
    });
    if (!res.ok) return "";
    const data = await res.json();

    const results: string[] = [];

    // Résultats organiques
    if (data.organic) {
      for (const r of data.organic.slice(0, 5)) {
        results.push(`TITRE: ${r.title}\nSOURCE: ${r.link}\nRÉSUMÉ: ${r.snippet}`);
      }
    }

    // Knowledge Graph (personnalités, infos factuelles)
    if (data.knowledgeGraph) {
      const kg = data.knowledgeGraph;
      const kgLines = [`NOM: ${kg.title}`, kg.type ? `TYPE: ${kg.type}` : "", kg.description ? `DESCRIPTION: ${kg.description}` : ""];
      if (kg.attributes) {
        for (const [k, v] of Object.entries(kg.attributes).slice(0, 8)) {
          kgLines.push(`${k}: ${v}`);
        }
      }
      results.unshift(kgLines.filter(Boolean).join("\n"));
    }

    // Top stories (actualités récentes)
    if (data.topStories) {
      for (const s of data.topStories.slice(0, 3)) {
        results.push(`ACTU: ${s.title}\nSOURCE: ${s.link}\nDATE: ${s.date || "récent"}`);
      }
    }

    return results.join("\n\n---\n\n");
  } catch {
    return "";
  }
}

async function fetchWikipediaImage(query: string): Promise<{ url: string; alt: string } | null> {
  try {
    const tryLang = async (lang: string) => {
      const res = await fetch(
        `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data.originalimage?.source || data.thumbnail?.source || null;
    };
    const url = (await tryLang("fr")) ?? (await tryLang("en"));
    if (url) return { url, alt: query };
    return null;
  } catch { return null; }
}

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

  const { sujet, categorieSlugHint, useWebSearch, imageUrl } = await req.json();

  // En mode photo, le sujet est optionnel. En mode texte, il est requis.
  if (!imageUrl && !sujet?.trim()) {
    return NextResponse.json({ error: "Sujet requis" }, { status: 400 });
  }

  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const jsonSchema = `{
  "titre": "Titre accrocheur SEO (max 80 chars)",
  "chapo": "Chapô de 2 phrases max, résumé percutant",
  "contenu": "<p>Corps de l'article en HTML...</p><h2>Sous-titre</h2><p>...</p>",
  "categorieSlug": "${categorieSlugHint || "actu|sport|economie|politique|success-stories|people|sante-beaute|fait-divers"}",
  "sousCategorie": "Sous-catégorie précise ou null",
  "tags": ["tag1", "tag2", "tag3"],
  "metaTitle": "Meta titre SEO (max 60 chars)",
  "metaDescription": "Meta description (max 155 chars)",
  "photoQuery": "Mot-clé pour chercher une photo (si besoin d'une autre image)"
}`;

  let response;

  if (imageUrl) {
    // Mode PHOTO — Claude analyse l'image et génère un article basé sur ce qu'il voit
    const photoPrompt = `Tu es un journaliste professionnel pour le média Réalitte (France).
Nous sommes le ${today}.

Analyse cette photo avec attention : identifie les personnes, le lieu, le contexte, l'événement ou le sujet représenté.${sujet ? `\nIndice supplémentaire donné par l'admin : "${sujet}"` : ""}

Ensuite rédige un article complet de 400 à 600 mots qui correspond exactement au contenu de cette photo. L'article doit parler de ce qui est visible sur la photo.

Règles :
- Contenu factuel, ton journalistique engagé
- HTML simple uniquement (p, h2, h3, blockquote)
- Langue française impeccable
- Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks

Structure JSON exacte :
${jsonSchema}`;

    response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "url", url: imageUrl } },
          { type: "text", text: photoPrompt },
        ],
      }],
    });
  } else {
    // Mode SUJET — comportement normal avec recherche web optionnelle
    let webContext = "";
    if (useWebSearch) {
      webContext = await searchWeb(sujet.trim());
    }

    const contextBlock = webContext
      ? `\n\nVoici des informations récentes trouvées sur internet sur ce sujet. Utilise ces faits réels pour écrire l'article :\n\n${webContext}\n\nIMPORTANT: Utilise ces informations réelles. Ne les invente pas, ne les modifie pas.`
      : "";

    const prompt = `Tu es un journaliste professionnel pour le média Réalitte (France).
Nous sommes le ${today}. Base-toi sur cette date pour tous les calculs de temps (échéances, délais, anniversaires, mandats, etc.).
Rédige un article complet et original sur le sujet suivant : "${sujet}"${contextBlock}

Règles :
- Contenu factuel, bien documenté, ton journalistique engagé
- Longueur : 400 à 600 mots dans le corps de l'article
- Formate le contenu en HTML simple (balises p, h2, h3, blockquote uniquement)
- Langue française impeccable
- Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks

Structure JSON exacte :
${jsonSchema}`;

    response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });
  }

  const webSearchUsed = !imageUrl && useWebSearch;

  try {

    const raw = (response.content[0] as { type: string; text: string }).text.trim();
    const jsonStr = raw.startsWith("{") ? raw : raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const parsed = JSON.parse(jsonStr);

    const categorie = await prisma.categorie.findFirst({
      where: { slug: parsed.categorieSlug },
    });
    if (!categorie) {
      return NextResponse.json({ error: `Catégorie "${parsed.categorieSlug}" introuvable` }, { status: 400 });
    }

    const baseSlug = slugify(parsed.titre);
    let slug = baseSlug;
    let attempt = 0;
    while (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++attempt}`;
    }

    const wordCount = parsed.contenu.replace(/<[^>]+>/g, "").split(/\s+/).length;

    let finalImageUrl: string | null = null;
    let finalImageAlt: string = sujet || "photo";

    if (imageUrl) {
      // Mode photo : on garde la photo uploadée telle quelle
      finalImageUrl = imageUrl;
      finalImageAlt = sujet || parsed.titre || "photo";
    } else {
      // Mode sujet : on cherche une image Wikipedia puis Unsplash
      const photoQuery = parsed.photoQuery || parsed.tags?.[0] || sujet;
      const image = (await fetchWikipediaImage(photoQuery)) ?? (await fetchUnsplashImage(photoQuery));
      finalImageUrl = image?.url || null;
      finalImageAlt = image?.alt || sujet || parsed.titre;
    }

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
        imageUrl: finalImageUrl,
        imageAlt: finalImageAlt,
      },
    });

    return NextResponse.json({
      articleId: article.id,
      titre: article.titre,
      slug: article.slug,
      webSearchUsed,
    });
  } catch (e) {
    console.error("generate-custom error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur" }, { status: 500 });
  }
}
