import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const FB_API = "https://graph.facebook.com/v19.0";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com").replace(/\/$/, "");
const INTERVAL_MINUTES = 15;

function nextSlot(lastMs: number): Date {
  const base = lastMs > Date.now() ? lastMs : Date.now();
  return new Date(base + INTERVAL_MINUTES * 60 * 1000);
}

function buildFbText(titre: string, chapo: string, slug: string, catSlug: string, tags: string[]): string {
  const url = `${SITE_URL}/${catSlug}/${slug}`;
  const hashtags = tags.slice(0, 5).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ");
  return [titre, "", chapo, "", `👉 ${url}`, hashtags ? `\n${hashtags}` : ""].join("\n").trim();
}

function buildIgText(titre: string, chapo: string, tags: string[]): string {
  const hashtags = tags.slice(0, 15).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ");
  return [titre, "", chapo, "", "🔗 Lien en bio", hashtags ? `\n.\n.\n.\n${hashtags}` : ""].join("\n").trim();
}

async function postToFacebook(pageId: string, token: string, message: string, articleUrl: string, imageUrl?: string | null) {
  if (imageUrl) {
    const params = new URLSearchParams({ url: imageUrl, message, access_token: token });
    const res = await fetch(`${FB_API}/${pageId}/photos`, { method: "POST", body: params });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error?.message || "Erreur Facebook");
  } else {
    const params = new URLSearchParams({ message, link: articleUrl, access_token: token });
    const res = await fetch(`${FB_API}/${pageId}/feed`, { method: "POST", body: params });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error?.message || "Erreur Facebook");
  }
}

async function postToInstagram(igUserId: string, token: string, message: string, imageUrl: string) {
  const cRes = await fetch(`${FB_API}/${igUserId}/media`, {
    method: "POST",
    body: new URLSearchParams({ image_url: imageUrl, caption: message, access_token: token }),
  });
  const cData = await cRes.json();
  if (!cRes.ok || cData.error) throw new Error(cData.error?.message || "Erreur Instagram media");

  const pRes = await fetch(`${FB_API}/${igUserId}/media_publish`, {
    method: "POST",
    body: new URLSearchParams({ creation_id: cData.id, access_token: token }),
  });
  const pData = await pRes.json();
  if (!pRes.ok || pData.error) throw new Error(pData.error?.message || "Erreur Instagram publish");
}

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

  // Vérifie si la file est vide
  const [pendingArticles, pendingSocial] = await Promise.all([
    prisma.article.count({ where: { statut: "PENDING", scheduledFor: { not: null } } }),
    prisma.socialQueueItem.count({ where: { statut: "PENDING" } }),
  ]);
  const queueVide = pendingArticles === 0 && pendingSocial === 0;

  const now = new Date();
  const fbText = buildFbText(article.titre, article.chapo, article.slug, article.categorie.slug, article.tags);
  const igText = buildIgText(article.titre, article.chapo, article.tags);
  const articleUrl = `${SITE_URL}/${article.categorie.slug}/${article.slug}`;

  // Charge les credentials Facebook / Instagram
  const configs = await prisma.siteConfig.findMany({
    where: { cle: { in: ["facebook_page_id", "facebook_page_token", "instagram_user_id"] } },
  });
  const get = (cle: string) => configs.find((c) => c.cle === cle)?.valeur || "";
  const pageId    = get("facebook_page_id");
  const pageToken = get("facebook_page_token");
  const igUserId  = get("instagram_user_id");

  // ── FILE VIDE → publication immédiate ────────────────────────────────────────
  if (queueVide) {
    await prisma.article.update({
      where: { id: articleId },
      data: { statut: "PUBLISHED", datePublication: now },
    });

    const fbOk = await postToFacebook(pageId, pageToken, fbText, articleUrl, article.imageUrl)
      .then(() => true)
      .catch(async (err) => {
        // Échec → on met en file pour retry
        await prisma.socialQueueItem.create({
          data: { articleId, network: "facebook", message: fbText, imageUrl: article.imageUrl, scheduledAt: now, erreur: String(err) },
        });
        return false;
      });

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

  // ── FILE NON VIDE → mise en file d'attente ───────────────────────────────────
  const [lastArticle, lastSocial] = await Promise.all([
    prisma.article.findFirst({
      where: { statut: "PENDING", scheduledFor: { not: null } },
      orderBy: { scheduledFor: "desc" },
      select: { scheduledFor: true },
    }),
    prisma.socialQueueItem.findFirst({
      where: { statut: "PENDING" },
      orderBy: { scheduledAt: "desc" },
      select: { scheduledAt: true },
    }),
  ]);

  const latestMs = Math.max(
    lastArticle?.scheduledFor?.getTime() || 0,
    lastSocial?.scheduledAt?.getTime() || 0,
  );
  const slot = nextSlot(latestMs);

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
