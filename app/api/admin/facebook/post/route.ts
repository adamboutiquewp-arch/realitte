import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const FB_API = "https://graph.facebook.com/v19.0";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com").replace(/\/$/, "");

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
  // Étape 1 — créer le container media
  const containerParams = new URLSearchParams({ image_url: imageUrl, caption: message, access_token: token });
  const containerRes = await fetch(`${FB_API}/${igUserId}/media`, { method: "POST", body: containerParams });
  const containerData = await containerRes.json();
  if (!containerRes.ok || containerData.error) throw new Error(containerData.error?.message || "Erreur Instagram media");

  // Étape 2 — publier le container
  const publishParams = new URLSearchParams({ creation_id: containerData.id, access_token: token });
  const publishRes = await fetch(`${FB_API}/${igUserId}/media_publish`, { method: "POST", body: publishParams });
  const publishData = await publishRes.json();
  if (!publishRes.ok || publishData.error) throw new Error(publishData.error?.message || "Erreur Instagram publish");

  return publishData.id;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { articleId, message, imageUrl, network } = await req.json();
  if (!articleId || !message?.trim()) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const [article, configs] = await Promise.all([
    prisma.article.findUnique({
      where: { id: articleId },
      include: { categorie: { select: { slug: true } } },
    }),
    prisma.siteConfig.findMany({
      where: { cle: { in: ["facebook_page_id", "facebook_page_token", "instagram_user_id"] } },
    }),
  ]);

  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

  const get = (cle: string) => configs.find((c) => c.cle === cle)?.valeur || "";
  const pageId    = get("facebook_page_id");
  const pageToken = get("facebook_page_token");
  const igUserId  = get("instagram_user_id");

  if (!pageId || !pageToken) {
    return NextResponse.json({ error: "Token Facebook non configuré dans les Paramètres." }, { status: 400 });
  }

  const articleUrl = `${SITE_URL}/${article.categorie.slug}/${article.slug}`;

  try {
    if (network === "instagram") {
      if (!igUserId) return NextResponse.json({ error: "Instagram Business Account ID non configuré dans les Paramètres." }, { status: 400 });
      if (!imageUrl) return NextResponse.json({ error: "Une image est requise pour Instagram." }, { status: 400 });
      const postId = await postToInstagram(igUserId, pageToken, message.trim(), imageUrl);
      return NextResponse.json({ success: true, postId, network: "instagram" });
    } else {
      const postId = await postToFacebook(pageId, pageToken, message.trim(), articleUrl, imageUrl);
      return NextResponse.json({ success: true, postId, network: "facebook" });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("Social post error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
