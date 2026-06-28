import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  getSocialCredentials, buildFbText, buildIgText,
  postToFacebook, postToInstagram, nextSlot, getLatestSlotMs, SITE_URL,
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

  if (queueVide) {
    // Publication immédiate sur le site
    await prisma.article.update({
      where: { id: articleId },
      data: { statut: "PUBLISHED", datePublication: now },
    });

    // Post Facebook immédiat
    const fbOk = await postToFacebook(pageId, pageToken, fbText, articleUrl, article.imageUrl)
      .then(() => true)
      .catch(async (err) => {
        await prisma.socialQueueItem.create({
          data: { articleId, network: "facebook", message: fbText, imageUrl: article.imageUrl, scheduledAt: now, erreur: String(err) },
        });
        return false;
      });

    // Post Instagram immédiat
    let igOk = false;
    if (article.imageUrl && igUserId && pageToken) {
      igOk = await postToInstagram(igUserId, pageToken, igText, article.imageUrl)
        .then(() => true)
        .catch(async (err) => {
          await prisma.socialQueueItem.create({
            data: { articleId, network: "instagram", message: igText, imageUrl: article.imageUrl, scheduledAt: now, erreur: String(err) },
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
      { articleId, network: "facebook",  message: fbText, imageUrl: article.imageUrl, scheduledAt: slot },
      { articleId, network: "instagram", message: igText, imageUrl: article.imageUrl, scheduledAt: slot },
    ],
  });

  return NextResponse.json({ ok: true, mode: "queued", scheduledFor: slot });
}
