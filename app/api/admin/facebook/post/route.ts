import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getSocialCredentials, postToFacebook, postToInstagram, SITE_URL } from "@/lib/social-posting";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { articleId, message, imageUrl, network } = await req.json();
  if (!articleId || !message?.trim()) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { categorie: { select: { slug: true } } },
  });
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

  const { pageId, pageToken, igUserId } = await getSocialCredentials();
  if (!pageId || !pageToken) {
    return NextResponse.json({ error: "Token Facebook non configuré dans les Paramètres." }, { status: 400 });
  }

  const articleUrl = `${SITE_URL}/${article.categorie.slug}/${article.slug}`;

  try {
    if (network === "instagram") {
      if (!igUserId) return NextResponse.json({ error: "Instagram Business Account ID non configuré." }, { status: 400 });
      if (!imageUrl) return NextResponse.json({ error: "Une image est requise pour Instagram." }, { status: 400 });
      const postId = await postToInstagram(igUserId, pageToken, message.trim(), imageUrl);
      return NextResponse.json({ success: true, postId, network: "instagram" });
    } else {
      const postId = await postToFacebook(pageId, pageToken, message.trim(), articleUrl, imageUrl);
      return NextResponse.json({ success: true, postId, network: "facebook" });
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 });
  }
}
