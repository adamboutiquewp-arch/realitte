import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new NextResponse("Non autorisé", { status: 401 });

  const configs = await prisma.siteConfig.findMany({
    where: { cle: { in: ["facebook_page_id", "facebook_page_token"] } },
  });
  const get = (cle: string) => configs.find((c) => c.cle === cle)?.valeur || "";
  const pageId    = get("facebook_page_id");
  const pageToken = get("facebook_page_token");

  const results: Record<string, unknown> = {};

  // 1. Cherche le compte Instagram lié à la page
  const r1 = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
  );
  results.instagram_business_account = await r1.json();

  // 2. Cherche aussi via les comptes liés
  const r2 = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${pageToken}`
  );
  results.accounts = await r2.json();

  return new NextResponse(JSON.stringify(results, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}
