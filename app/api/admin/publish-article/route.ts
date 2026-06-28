import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  buildFbText, buildIgText,
  nextSlot, getLatestSlotMs,
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

  // Image Facebook (originale ou Unsplash landscape)
  let imageUrl = article.imageUrl;
  if (!imageUrl) {
    imageUrl = await fetchUnsplashImage(article.tags[0] || article.titre);
    if (imageUrl) {
      await prisma.article.update({ where: { id: articleId }, data: { imageUrl } });
    }
  }

  // Image Instagram : toujours carré 1:1 garanti
  const igImageUrl = await fetchInstagramImage(article.tags[0] || article.titre) || imageUrl;

  // Prochain créneau disponible (15 min après le dernier élément en file)
  const slot = nextSlot(await getLatestSlotMs());

  // Site + FB + IG tous programmés au même créneau — le cron publie tout ensemble
  await prisma.article.update({
    where: { id: articleId },
    data: { scheduledFor: slot },
  });

  const fbText = buildFbText(article.titre, article.chapo, article.slug, article.categorie.slug, article.tags);
  const igText = buildIgText(article.titre, article.chapo, article.tags);

  await prisma.socialQueueItem.createMany({
    data: [
      { articleId, network: "facebook",  message: fbText, imageUrl,            scheduledAt: slot },
      { articleId, network: "instagram", message: igText, imageUrl: igImageUrl, scheduledAt: slot },
    ],
  });

  return NextResponse.json({ ok: true, scheduledFor: slot });
}
