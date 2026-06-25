import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const FB_API = "https://graph.facebook.com/v21.0";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { articleId, message, imageUrl } = await req.json();
  if (!articleId) {
    return NextResponse.json({ error: "articleId manquant" }, { status: 400 });
  }

  const configs = await prisma.siteConfig.findMany({
    where: { cle: { in: ["facebook_page_id", "facebook_page_token"] } },
  });

  const getConfig = (cle: string) => configs.find((c) => c.cle === cle)?.valeur || "";
  const pageId = getConfig("facebook_page_id");
  const pageToken = getConfig("facebook_page_token");

  if (!pageId || !pageToken) {
    return NextResponse.json(
      { error: "Token Facebook non configuré. Allez dans Paramètres > Facebook." },
      { status: 400 }
    );
  }

  if (!message?.trim()) {
    return NextResponse.json({ error: "Le texte du post est vide" }, { status: 400 });
  }

  try {
    let postId: string;

    if (imageUrl) {
      const params = new URLSearchParams({
        url: imageUrl,
        message: message.trim(),
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
      const params = new URLSearchParams({
        message: message.trim(),
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
