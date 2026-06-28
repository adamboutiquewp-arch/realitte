import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  buildFbText, buildIgText,
  nextSlot, getLatestSlotMs, SITE_URL,
  fetchUnsplashImage, fetchInstagramImage,
} from "@/lib/social-posting";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { articleId } = await req.json();
  if (!articleId) return NextResponse.json({ error: "articleId requis" }, { status: 400 });

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { categorie: { select: { slug: true } } },
  });
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

  const now = new Date();

  // 1. Publier l'article IMMÉDIATEMENT sur le site
  await prisma.article.update({
    where: { id: articleId },
    data: { statut: "PUBLISHED", datePublication: now },
  });

  // 2. Image Facebook (originale ou Unsplash landscape)
  let imageUrl = article.imageUrl;
  if (!imageUrl) {
    imageUrl = await fetchUnsplashImage(article.tags[0] || article.titre);
    if (imageUrl) {
      await prisma.article.update({ where: { id: articleId }, data: { imageUrl } });
    }
  }

  // 3. Image Instagram : toujours carré 1:1 garanti via Unsplash
  const igImageUrl = await fetchInstagramImage(article.tags[0] || article.titre) || imageUrl;

  // 4. FB + IG toujours en file — jamais de post immédiat (évite les bugs de timing et les erreurs Meta)
  const fbText = buildFbText(article.titre, article.chapo, article.slug, article.categorie.slug, article.tags);
  const igText = buildIgText(article.titre, article.chapo, article.tags);
  const slot = nextSlot(await getLatestSlotMs());

  await prisma.socialQueueItem.createMany({
    data: [
      { articleId, network: "facebook",  message: fbText, imageUrl,            scheduledAt: slot },
      { articleId, network: "instagram", message: igText, imageUrl: igImageUrl, scheduledAt: slot },
    ],
  });

  return NextResponse.json({ ok: true, scheduledFor: slot });
}
