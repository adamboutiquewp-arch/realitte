import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSocialCredentials, postToFacebook, postToInstagram, toInstagramUrl, SITE_URL } from "@/lib/social-posting";
import { sendPushToAll } from "@/lib/push-notifications";

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  // Vercel envoie Authorization: Bearer <secret> pour les crons automatiques
  if (req.headers.get("authorization") === `Bearer ${cronSecret}`) return true;
  // Déclenchement manuel via l'admin
  if (req.headers.get("x-cron-secret") === cronSecret) return true;
  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();
  let articlesPublies = 0;
  let postsTraites = 0;
  const errors: string[] = [];

  // 1. Publier les articles dus
  const articlesDus = await prisma.article.findMany({
    where: { statut: "PENDING", scheduledFor: { not: null, lte: now } },
    select: { id: true, titre: true, chapo: true, slug: true, imageUrl: true, categorie: { select: { slug: true } } },
  });
  for (const article of articlesDus) {
    try {
      await prisma.article.update({
        where: { id: article.id },
        data: { statut: "PUBLISHED", datePublication: now },
      });
      articlesPublies++;
      // Notification push aux abonnés
      const articleUrl = `${SITE_URL}/${article.categorie.slug}/${article.slug}`;
      sendPushToAll(
        article.titre,
        article.chapo?.slice(0, 100) || "Nouvel article sur Réalitte",
        articleUrl
      ).catch(() => {});
    } catch (err) {
      errors.push(`Article ${article.id}: ${err instanceof Error ? err.message : "erreur"}`);
    }
  }

  // 2. Traiter les posts sociaux dus
  const postsDus = await prisma.socialQueueItem.findMany({
    where: { statut: "PENDING", scheduledAt: { lte: now } },
    include: { article: { select: { slug: true, imageUrl: true, categorie: { select: { slug: true } } } } },
    orderBy: { scheduledAt: "asc" },
  });

  if (postsDus.length > 0) {
    const { pageId, pageToken, igUserId } = await getSocialCredentials();

    for (const item of postsDus) {
      try {
        const articleUrl = `${SITE_URL}/${item.article.categorie.slug}/${item.article.slug}`;
        if (item.network === "instagram") {
          if (!igUserId || !pageToken) throw new Error("Instagram non configuré");
          const igImage = toInstagramUrl(item.article.imageUrl || item.imageUrl);
          if (!igImage) throw new Error("Image requise pour Instagram");
          await postToInstagram(igUserId, pageToken, item.message, igImage);
        } else {
          if (!pageId || !pageToken) throw new Error("Facebook non configuré");
          await postToFacebook(pageId, pageToken, item.message, articleUrl, item.imageUrl);
        }
        await prisma.socialQueueItem.update({
          where: { id: item.id },
          data: { statut: "DONE", processedAt: now },
        });
        postsTraites++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "erreur inconnue";
        await prisma.socialQueueItem.update({
          where: { id: item.id },
          data: { statut: "ERROR", processedAt: now, erreur: msg },
        });
        errors.push(`Social ${item.id} (${item.network}): ${msg}`);
      }
    }
  }

  return NextResponse.json({ articlesPublies, postsTraites, errors });
}
