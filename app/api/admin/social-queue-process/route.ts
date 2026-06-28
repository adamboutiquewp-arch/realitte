import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const FB_API = "https://graph.facebook.com/v19.0";

async function postToFacebook(pageId: string, token: string, message: string, articleUrl: string, imageUrl?: string | null) {
  if (imageUrl) {
    const params = new URLSearchParams({ url: imageUrl, message, access_token: token });
    const res = await fetch(`${FB_API}/${pageId}/photos`, { method: "POST", body: params });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error?.message || "Erreur Facebook photo");
    return data.post_id || data.id;
  } else {
    const params = new URLSearchParams({ message, link: articleUrl, access_token: token });
    const res = await fetch(`${FB_API}/${pageId}/feed`, { method: "POST", body: params });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error?.message || "Erreur Facebook feed");
    return data.id;
  }
}

async function postToInstagram(igUserId: string, token: string, message: string, imageUrl: string) {
  const containerParams = new URLSearchParams({ image_url: imageUrl, caption: message, access_token: token });
  const containerRes = await fetch(`${FB_API}/${igUserId}/media`, { method: "POST", body: containerParams });
  const containerData = await containerRes.json();
  if (!containerRes.ok || containerData.error) throw new Error(containerData.error?.message || "Erreur Instagram media");

  const publishParams = new URLSearchParams({ creation_id: containerData.id, access_token: token });
  const publishRes = await fetch(`${FB_API}/${igUserId}/media_publish`, { method: "POST", body: publishParams });
  const publishData = await publishRes.json();
  if (!publishRes.ok || publishData.error) throw new Error(publishData.error?.message || "Erreur Instagram publish");

  return publishData.id;
}

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const now = new Date();
  let articlesPublies = 0;
  let postsTraites = 0;
  const errors: string[] = [];

  // Publier les articles dont la date est arrivée
  const articlesDus = await prisma.article.findMany({
    where: { statut: "PENDING", scheduledFor: { not: null, lte: now } },
  });

  for (const article of articlesDus) {
    try {
      await prisma.article.update({
        where: { id: article.id },
        data: { statut: "PUBLISHED", datePublication: now },
      });
      articlesPublies++;
    } catch (err) {
      errors.push(`Article ${article.id}: ${err instanceof Error ? err.message : "erreur"}`);
    }
  }

  // Traiter les posts réseaux sociaux dus
  const postsDus = await prisma.socialQueueItem.findMany({
    where: { statut: "PENDING", scheduledAt: { lte: now } },
    include: { article: { include: { categorie: { select: { slug: true } } } } },
    orderBy: { scheduledAt: "asc" },
  });

  if (postsDus.length > 0) {
    const configs = await prisma.siteConfig.findMany({
      where: { cle: { in: ["facebook_page_id", "facebook_page_token", "instagram_user_id"] } },
    });
    const get = (cle: string) => configs.find((c) => c.cle === cle)?.valeur || "";
    const pageId    = get("facebook_page_id");
    const pageToken = get("facebook_page_token");
    const igUserId  = get("instagram_user_id");
    const SITE_URL  = (process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com").replace(/\/$/, "");

    for (const item of postsDus) {
      try {
        const articleUrl = `${SITE_URL}/${item.article.categorie.slug}/${item.article.slug}`;
        if (item.network === "instagram") {
          if (!igUserId || !pageToken) throw new Error("Instagram non configuré");
          if (!item.imageUrl) throw new Error("Image requise pour Instagram");
          await postToInstagram(igUserId, pageToken, item.message, item.imageUrl);
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
        errors.push(`${item.network}: ${msg}`);
      }
    }
  }

  return NextResponse.json({ articlesPublies, postsTraites, errors });
}
