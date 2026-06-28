import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FB_API = "https://graph.facebook.com/v19.0";
const REDIRECT_URI = "https://www.realitte.com/api/admin/facebook-callback";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      `https://www.realitte.com/admin/facebook-connect?error=${encodeURIComponent(error || "annulé")}`
    );
  }

  const appId     = process.env.FACEBOOK_APP_ID!;
  const appSecret = process.env.FACEBOOK_APP_SECRET!;

  // 1. Échange le code contre un token court
  const tokenRes = await fetch(
    `${FB_API}/oauth/access_token?client_id=${appId}&redirect_uri=${REDIRECT_URI}&client_secret=${appSecret}&code=${code}`
  );
  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    return NextResponse.redirect(
      `https://www.realitte.com/admin/facebook-connect?error=${encodeURIComponent(tokenData.error.message)}`
    );
  }

  // 2. Échange contre un token long (60 jours)
  const longRes = await fetch(
    `${FB_API}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenData.access_token}`
  );
  const longData = await longRes.json();
  const longToken = longData.access_token || tokenData.access_token;

  // 3. Récupère les pages gérées
  const accountsRes = await fetch(`${FB_API}/me/accounts?access_token=${longToken}`);
  const accountsData = await accountsRes.json();

  let pageToken = "";
  let pageId    = "";

  if (accountsData.data && accountsData.data.length > 0) {
    // Token de page via /me/accounts
    const page = accountsData.data.find(
      (p: { name: string }) => p.name.toLowerCase().includes("realitte")
    ) || accountsData.data[0];
    pageToken = page.access_token;
    pageId    = page.id;
  } else {
    // Fallback : récupère le token de page directement via l'ID connu
    const knownPageId = "1163796830151892";
    const pageRes = await fetch(
      `${FB_API}/${knownPageId}?fields=access_token,id,name&access_token=${longToken}`
    );
    const pageData = await pageRes.json();
    if (pageData.access_token) {
      pageToken = pageData.access_token;
      pageId    = pageData.id;
    } else {
      // Dernier recours : utilise le long token utilisateur directement
      pageToken = longToken;
      pageId    = knownPageId;
    }
  }

  // 5. Récupère l'ID Instagram lié à la page
  let igId = "";
  const igRes = await fetch(`${FB_API}/${pageId}?fields=instagram_business_account&access_token=${pageToken}`);
  const igData = await igRes.json();
  if (igData.instagram_business_account?.id && igData.instagram_business_account.id !== pageId) {
    igId = igData.instagram_business_account.id;
  }

  // 6. Sauvegarde dans la DB
  await Promise.all([
    prisma.siteConfig.upsert({
      where: { cle: "facebook_page_token" },
      create: { cle: "facebook_page_token", valeur: pageToken },
      update: { valeur: pageToken },
    }),
    prisma.siteConfig.upsert({
      where: { cle: "facebook_page_id" },
      create: { cle: "facebook_page_id", valeur: pageId },
      update: { valeur: pageId },
    }),
    ...(igId ? [prisma.siteConfig.upsert({
      where: { cle: "instagram_user_id" },
      create: { cle: "instagram_user_id", valeur: igId },
      update: { valeur: igId },
    })] : []),
  ]);

  return NextResponse.redirect("https://www.realitte.com/api/admin/diagnostic-meta?connected=1");
}
