import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com").replace(/\/$/, "");
const FB_API = "https://graph.facebook.com/v21.0";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { articleId } = await req.json();
  if (!articleId) {
    return NextResponse.json({ error: "articleId manquant" }, { status: 400 });
  }

  const [article, configs] = await Promise.all([
    prisma.article.findUnique({
      where: { id: articleId },
      include: { categorie: { select: { slug: true } } },
    }),
    prisma.siteConfig.findMany({
      where: { cle: { in: ["facebook_page_id", "facebook_page_token"] } },
    }),
  ]);

  if (!article) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }

  const getConfig = (cle: string) => configs.find((c) => c.cle === cle)?.valeur || "";
  const pageId = getConfig("facebook_page_id");
  const pageToken = getConfig("facebook_page_token");

  if (!pageId || !pageToken) {
    return NextResponse.json(
      { error: "Token Facebook non configuré. Allez dans Paramètres > Facebook." },
      { status: 400 }
    );
  }

  const articleUrl = `${SITE_URL}/${article.categorie.slug}/${article.slug}`;
  const hashtags = article.tags
    .slice(0, 5)
    .map((t) => `#${t.replace(/\s+/g, "")}`)
    .join(" ");

  const message = [
    article.titre,
    "",
    article.chapo,
    "",
    `Lire la suite 👉 ${articleUrl}`,
    hashtags ? `\n${hashtags}` : "",
  ]
    .join("\n")
    .trim();

  try {
    let postId: string;

    if (article.imageUrl) {
      // Post avec photo
      const params = new URLSearchParams({
        url: article.imageUrl,
        message,
        access_token: pageToken,
      });
      const res = await fetch(`${FB_API}/${pageId}/photos`, {
        method: "POST",
        body: params,
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return NextResponse.json(
          { error: data.error?.message || "Erreur Facebook API (photo)" },
          { status: 500 }
        );
      }
      postId = data.post_id || data.id;
    } else {
      // Post sans photo (lien uniquement)
      const params = new URLSearchParams({
        message,
        link: articleUrl,
        access_token: pageToken,
      });
      const res = await fetch(`${FB_API}/${pageId}/feed`, {
        method: "POST",
        body: params,
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return NextResponse.json(
          { error: data.error?.message || "Erreur Facebook API (feed)" },
          { status: 500 }
        );
      }
      postId = data.id;
    }

    return NextResponse.json({ success: true, postId });
  } catch (err) {
    console.error("Facebook post error:", err);
    return NextResponse.json({ error: "Erreur réseau vers Facebook" }, { status: 500 });
  }
}
