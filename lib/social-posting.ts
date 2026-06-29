import { prisma } from "@/lib/prisma";

export const FB_API  = "https://graph.facebook.com/v19.0";

export async function fetchUnsplashImage(query: string): Promise<string | null> {
  if (!process.env.UNSPLASH_ACCESS_KEY) return null;
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0]?.urls?.regular || null;
  } catch {
    return null;
  }
}

// Image carrée 1:1 garantie pour Instagram (ratio imposé par l'API Meta)
export async function fetchInstagramImage(query: string): Promise<string | null> {
  if (!process.env.UNSPLASH_ACCESS_KEY) return null;
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=squarish`,
      { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.results?.[0]?.urls?.raw;
    if (!raw) return null;
    return `${raw}&w=1080&h=1080&fit=crop&crop=center&auto=format&q=80`;
  } catch {
    return null;
  }
}

// Redimensionne automatiquement n'importe quelle image en 1080x1080 pour Instagram
// via wsrv.nl (service gratuit de transformation d'image par URL)
export function toInstagramUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  return `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=1080&h=1080&fit=cover&a=center&output=jpg&q=85`;
}
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com").replace(/\/$/, "");
export const INTERVAL_MINUTES = 15;

// ── Credentials ──────────────────────────────────────────────────────────────

export async function getSocialCredentials() {
  const configs = await prisma.siteConfig.findMany({
    where: { cle: { in: ["facebook_page_id", "facebook_page_token", "instagram_user_id"] } },
  });
  const get = (cle: string) => configs.find((c) => c.cle === cle)?.valeur || "";
  return {
    pageId:    get("facebook_page_id"),
    pageToken: get("facebook_page_token"),
    igUserId:  get("instagram_user_id"),
  };
}

// ── Texte des posts ───────────────────────────────────────────────────────────

export function buildFbText(titre: string, chapo: string, slug: string, catSlug: string, tags: string[]): string {
  const url = `${SITE_URL}/${catSlug}/${slug}`;
  const hashtags = tags.slice(0, 5).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ");
  return [titre, "", chapo, "", `👉 ${url}`, hashtags ? `\n${hashtags}` : ""].join("\n").trim();
}

export function buildIgText(titre: string, chapo: string, tags: string[]): string {
  const hashtags = tags.slice(0, 15).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ");
  return [titre, "", chapo, "", "🔗 Lien en bio", hashtags ? `\n.\n.\n.\n${hashtags}` : ""].join("\n").trim();
}

// ── Prochain créneau dans la file ─────────────────────────────────────────────

export function nextSlot(lastMs: number): Date {
  const base = lastMs > Date.now() ? lastMs : Date.now();
  return new Date(base + INTERVAL_MINUTES * 60 * 1000);
}

export async function getLatestSlotMs(): Promise<number> {
  const cutoff = new Date(Date.now() - INTERVAL_MINUTES * 60 * 1000);
  const [lastPendingArticle, lastPendingSocial, lastPublished] = await Promise.all([
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
    // Articles publiés dans les 15 dernières minutes → on doit attendre avant le suivant
    prisma.article.findFirst({
      where: { statut: "PUBLISHED", datePublication: { gte: cutoff } },
      orderBy: { datePublication: "desc" },
      select: { datePublication: true },
    }),
  ]);
  return Math.max(
    lastPendingArticle?.scheduledFor?.getTime() || 0,
    lastPendingSocial?.scheduledAt?.getTime() || 0,
    lastPublished?.datePublication?.getTime() || 0,
  );
}

// ── Appels API Meta ───────────────────────────────────────────────────────────

export async function postToFacebook(
  pageId: string, token: string, message: string, articleUrl: string, imageUrl?: string | null
) {
  const params = new URLSearchParams({ message, link: articleUrl, access_token: token });
  const res = await fetch(`${FB_API}/${pageId}/feed`, { method: "POST", body: params });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error?.message || "Erreur Facebook feed");
  return data.id;
}

export async function postToInstagram(igUserId: string, token: string, message: string, imageUrl: string) {
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
  return pData.id;
}
