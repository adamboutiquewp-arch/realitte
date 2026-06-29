import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  buildFbText, buildIgText,
  nextSlot, getLatestSlotMs,
  fetchInstagramImage, toInstagramUrl,
  getSocialCredentials, postToFacebook, postToInstagram, SITE_URL,
} from "@/lib/social-posting";
import { sendPushToAll } from "@/lib/push-notifications";

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

  // Image commune pour le site, Facebook et Instagram
  let imageUrl = article.imageUrl;
  if (!imageUrl) {
    imageUrl = await fetchInstagramImage(article.tags[0] || article.titre);
    if (imageUrl) {
      await prisma.article.update({ where: { id: articleId }, data: { imageUrl } });
    }
  }

  const fbText  = buildFbText(article.titre, article.chapo, article.slug, article.categorie.slug, article.tags);
  const igText  = buildIgText(article.titre, article.chapo, article.tags);
  const articleUrl = `${SITE_URL}/${article.categorie.slug}/${article.slug}`;
  const igImage = toInstagramUrl(imageUrl);

  const latestMs = await getLatestSlotMs();

  // ── CAS 1 : file vide ET rien publié depuis moins de 15 min → IMMÉDIAT ──
  if (latestMs === 0) {
    const now = new Date();

    await prisma.article.update({
      where: { id: articleId },
      data: { statut: "PUBLISHED", datePublication: now },
    });

    const { pageId, pageToken, igUserId } = await getSocialCredentials();
    let fbOk = false;
    let igOk = false;

    try {
      await postToFacebook(pageId, pageToken, fbText, articleUrl, imageUrl);
      fbOk = true;
    } catch (err) {
      console.error("FB immédiat:", err);
    }

    try {
      if (igUserId && pageToken && igImage) {
        await postToInstagram(igUserId, pageToken, igText, igImage);
        igOk = true;
      }
    } catch (err) {
      console.error("IG immédiat:", err);
    }

    // Notification push — fire & forget
    sendPushToAll(
      article.titre,
      article.chapo?.slice(0, 100) || "Nouvel article sur Réalitte",
      articleUrl
    ).catch(() => {});

    return NextResponse.json({ ok: true, mode: "immediate", fbOk, igOk });
  }

  // ── CAS 2 : quelque chose récemment publié ou en file → PROGRAMMER ──
  const slot = nextSlot(latestMs);

  await prisma.article.update({
    where: { id: articleId },
    data: { scheduledFor: slot },
  });

  await prisma.socialQueueItem.createMany({
    data: [
      { articleId, network: "facebook",  message: fbText, imageUrl,   scheduledAt: slot },
      { articleId, network: "instagram", message: igText, imageUrl: igImage, scheduledAt: slot },
    ],
  });

  return NextResponse.json({ ok: true, scheduledFor: slot });
}
