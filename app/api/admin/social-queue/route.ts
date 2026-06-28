import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { fetchInstagramImage } from "@/lib/social-posting";

const INTERVAL_MINUTES = 15;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com").replace(/\/$/, "");

function nextSlot(lastDate: Date | null): Date {
  const base = lastDate && lastDate > new Date() ? lastDate : new Date();
  return new Date(base.getTime() + INTERVAL_MINUTES * 60 * 1000);
}

function buildSocialText(
  titre: string, chapo: string, slug: string, categorieSlug: string, tags: string[],
  network: "facebook" | "instagram"
): string {
  const url = `${SITE_URL}/${categorieSlug}/${slug}`;
  const hashtags5 = tags.slice(0, 5).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ");
  const hashtags15 = tags.slice(0, 15).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ");
  if (network === "facebook") {
    return [titre, "", chapo, "", `👉 ${url}`, hashtags5 ? `\n${hashtags5}` : ""].join("\n").trim();
  }
  return [titre, "", chapo, "", "🔗 Lien en bio", hashtags15 ? `\n.\n.\n.\n${hashtags15}` : ""].join("\n").trim();
}

// GET — liste la file d'attente complète
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const [articles, socialPosts] = await Promise.all([
    prisma.article.findMany({
      where: { statut: "PENDING", scheduledFor: { not: null } },
      select: {
        id: true, titre: true, chapo: true, scheduledFor: true,
        categorie: { select: { nom: true, couleur: true } },
      },
      orderBy: { scheduledFor: "asc" },
    }),
    prisma.socialQueueItem.findMany({
      where: { statut: "PENDING" },
      select: {
        id: true, network: true, message: true, scheduledAt: true,
        article: { select: { id: true, titre: true, slug: true, categorie: { select: { slug: true } } } },
      },
      orderBy: { scheduledAt: "asc" },
    }),
  ]);

  return NextResponse.json({ articles, socialPosts });
}

// POST — ajoute à la file
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { type } = body;

  if (type === "article") {
    const { articleId } = body;
    if (!articleId) return NextResponse.json({ error: "articleId requis" }, { status: 400 });

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { categorie: { select: { slug: true } } },
    });
    if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
    if (article.statut !== "PENDING") return NextResponse.json({ error: "L'article n'est pas en attente (statut: " + article.statut + ")" }, { status: 400 });

    // Trouve le dernier créneau pour les articles
    const lastArticle = await prisma.article.findFirst({
      where: { statut: "PENDING", scheduledFor: { not: null } },
      orderBy: { scheduledFor: "desc" },
      select: { scheduledFor: true },
    });
    const articleSlot = nextSlot(lastArticle?.scheduledFor ?? null);

    // Trouve le dernier créneau pour les posts sociaux
    const lastSocial = await prisma.socialQueueItem.findFirst({
      where: { statut: "PENDING" },
      orderBy: { scheduledAt: "desc" },
      select: { scheduledAt: true },
    });
    // Les posts sociaux se programment au même moment que l'article (traités après dans le même cycle)
    const socialBase = lastSocial?.scheduledAt && lastSocial.scheduledAt > articleSlot ? lastSocial.scheduledAt : articleSlot;

    await prisma.article.update({
      where: { id: articleId },
      data: { scheduledFor: articleSlot },
    });

    // Crée automatiquement les posts FB et Instagram dans la file
    const fbText = buildSocialText(article.titre, article.chapo, article.slug, article.categorie.slug, article.tags, "facebook");
    const igText = buildSocialText(article.titre, article.chapo, article.slug, article.categorie.slug, article.tags, "instagram");

    // Même image pour FB et IG — fallback Unsplash carré si pas d'image
    let imageUrl = article.imageUrl;
    if (!imageUrl) {
      imageUrl = await fetchInstagramImage(article.tags[0] || article.titre);
      if (imageUrl) {
        await prisma.article.update({ where: { id: articleId }, data: { imageUrl } });
      }
    }

    await prisma.socialQueueItem.createMany({
      data: [
        { articleId, network: "facebook",  message: fbText, imageUrl, scheduledAt: socialBase },
        { articleId, network: "instagram", message: igText, imageUrl, scheduledAt: socialBase },
      ],
    });

    return NextResponse.json({ ok: true, scheduledFor: articleSlot, socialPosts: 2 });
  }

  // Appelé quand on publie directement un article (sans passer par la file)
  if (type === "social-auto") {
    const { articleId } = body;
    if (!articleId) return NextResponse.json({ error: "articleId requis" }, { status: 400 });

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { categorie: { select: { slug: true } } },
    });
    if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

    const lastSocial = await prisma.socialQueueItem.findFirst({
      where: { statut: "PENDING" },
      orderBy: { scheduledAt: "desc" },
      select: { scheduledAt: true },
    });
    const slot1 = nextSlot(lastSocial?.scheduledAt ?? null);
    const slot2 = new Date(slot1.getTime() + INTERVAL_MINUTES * 60 * 1000);

    const fbText = buildSocialText(article.titre, article.chapo, article.slug, article.categorie.slug, article.tags, "facebook");
    const igText = buildSocialText(article.titre, article.chapo, article.slug, article.categorie.slug, article.tags, "instagram");

    let imageUrl = article.imageUrl;
    if (!imageUrl) {
      imageUrl = await fetchInstagramImage(article.tags[0] || article.titre);
      if (imageUrl) {
        await prisma.article.update({ where: { id: articleId }, data: { imageUrl } });
      }
    }

    await prisma.socialQueueItem.createMany({
      data: [
        { articleId, network: "facebook",  message: fbText, imageUrl, scheduledAt: slot1 },
        { articleId, network: "instagram", message: igText, imageUrl, scheduledAt: slot2 },
      ],
    });

    return NextResponse.json({ ok: true, socialPosts: 2 });
  }

  if (type === "social") {
    const { articleId, network, message, imageUrl } = body;
    if (!articleId || !network || !message) {
      return NextResponse.json({ error: "articleId, network et message requis" }, { status: 400 });
    }
    if (!["facebook", "instagram"].includes(network)) {
      return NextResponse.json({ error: "Réseau non supporté (facebook ou instagram uniquement)" }, { status: 400 });
    }

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

    const last = await prisma.socialQueueItem.findFirst({
      where: { statut: "PENDING" },
      orderBy: { scheduledAt: "desc" },
      select: { scheduledAt: true },
    });

    const slot = nextSlot(last?.scheduledAt ?? null);
    const item = await prisma.socialQueueItem.create({
      data: { articleId, network, message, imageUrl: imageUrl || null, scheduledAt: slot },
    });

    return NextResponse.json({ ok: true, id: item.id, scheduledAt: slot });
  }

  return NextResponse.json({ error: "type invalide (article ou social)" }, { status: 400 });
}

// DELETE — retire un élément de la file
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { type, id } = body;

  if (type === "article") {
    await prisma.article.update({
      where: { id },
      data: { scheduledFor: null },
    });
    return NextResponse.json({ ok: true });
  }

  if (type === "social") {
    await prisma.socialQueueItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "type invalide" }, { status: 400 });
}
