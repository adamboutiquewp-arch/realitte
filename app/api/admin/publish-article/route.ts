import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  getSocialCredentials, buildFbText, buildIgText,
  postToFacebook, postToInstagram, nextSlot, getLatestSlotMs, SITE_URL,
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

  // File vide = publication immédiate, sinon = mise en file
  const [pendingArticles, pendingSocial] = await Promise.all([
    prisma.article.count({ where: { statut: "PENDING", scheduledFor: { not: null } } }),
    prisma.socialQueueItem.count({ where: { statut: "PENDING" } }),
  ]);
  const queueVide = pendingArticles === 0 && pendingSocial === 0;

  const now = new Date();
  const { pageId, pageToken, igUserId } = await getSocialCredentials();
  const articleUrl = `${SITE_URL}/${article.categorie.slug}/${article.slug}`;
  const fbText = buildFbText(article.titre, article.chapo, article.slug, article.categorie.slug, article.tags);
  const igText = buildIgText(article.titre, article.chapo, article.tags);

  // Image Facebook : image de l'article ou Unsplash landscape en fallback
  let imageUrl = article.imageUrl;
  if (!imageUrl) {
    imageUrl = await fetchUnsplashImage(article.tags[0] || article.titre);
    if (imageUrl) {
      await prisma.article.update({ where: { id: articleId }, data: { imageUrl } });
    }
  }

  // Image Instagram : toujours carré 1:1 via Unsplash pour éviter les erreurs de ratio
  const igImageUrl = await fetchInstagramImage(article.tags[0] || article.titre) || imageUrl;

  if (queueVide) {
    // Publication immédiate sur le site
    await prisma.article.update({
      where: { id: articleId },
      data: { statut: "PUBLISHED", datePublication: now },
    });

    // Post Facebook immédiat
    const fbOk = await postToFacebook(pageId, pageToken, fbText, articleUrl, imageUrl)
      .then(() => true)
      .catch(async (err) => {
        await prisma.socialQueueItem.create({
          data: { articleId, network: "facebook", message: fbText, imageUrl, scheduledAt: now, erreur: String(err) },
        });
        return false;
      });

    // Post Instagram immédiat (image carrée dédiée)
    let igOk = false;
    if (igImageUrl && igUserId && pageToken) {
      igOk = await postToInstagram(igUserId, pageToken, igText, igImageUrl)
        .then(() => true)
        .catch(async (err) => {
          await prisma.socialQueueItem.create({
            data: { articleId, network: "instagram", message: igText, imageUrl: igImageUrl, scheduledAt: now, erreur: String(err) },
          });
          return false;
        });
    }

    return NextResponse.json({ ok: true, mode: "immediate", fbOk, igOk });
  }

  // Mise en file : article + posts sociaux au même créneau
  const slot = nextSlot(await getLatestSlotMs());

  await prisma.article.update({
    where: { id: articleId },
    data: { scheduledFor: slot },
  });

  await prisma.socialQueueItem.createMany({
    data: [
      { articleId, network: "facebook",  message: fbText, imageUrl,       scheduledAt: slot },
      { articleId, network: "instagram", message: igText, imageUrl: igImageUrl, scheduledAt: slot },
    ],
  });

  return NextResponse.json({ ok: true, mode: "queued", scheduledFor: slot });
}
