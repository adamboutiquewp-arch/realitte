import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { categorie } = await req.json();
  if (!categorie) {
    return NextResponse.json({ error: "Catégorie manquante" }, { status: 400 });
  }

  // Récupère les URLs des sources qui ont déjà généré un article
  const articlesExistants = await prisma.article.findMany({
    where: { categorie: { slug: categorie } },
    select: { sourceUrl: true },
  });
  const urlsAvecArticle = new Set(articlesExistants.map((a) => a.sourceUrl).filter(Boolean));

  // Remet traite=false uniquement sur les sources qui n'ont PAS généré d'article
  const sources = await prisma.sourceBrute.findMany({
    where: { categorie, traite: true },
    select: { id: true, url: true },
  });

  const idsAReset = sources
    .filter((s) => !urlsAvecArticle.has(s.url))
    .map((s) => s.id);

  if (idsAReset.length === 0) {
    return NextResponse.json({ reset: 0, message: "Aucune source à réinitialiser" });
  }

  await prisma.sourceBrute.updateMany({
    where: { id: { in: idsAReset } },
    data: { traite: false },
  });

  return NextResponse.json({ reset: idsAReset.length });
}
