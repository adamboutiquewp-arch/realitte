import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const [
    sourcesBrutes,
    articlesParStatut,
    derniersLogs,
    derniersArticles,
  ] = await Promise.all([
    // Sources non traitées par catégorie
    prisma.sourceBrute.groupBy({
      by: ["categorie", "traite"],
      _count: true,
    }),
    // Articles par statut
    prisma.article.groupBy({
      by: ["statut"],
      _count: true,
    }),
    // 5 derniers logs pipeline
    prisma.pipelineLog.findMany({
      orderBy: { dateCreation: "desc" },
      take: 5,
    }),
    // 10 derniers articles créés (tout statut)
    prisma.article.findMany({
      orderBy: { dateCreation: "desc" },
      take: 10,
      select: {
        id: true,
        titre: true,
        statut: true,
        dateCreation: true,
        categorie: { select: { nom: true, slug: true } },
      },
    }),
  ]);

  return NextResponse.json({
    sourcesBrutes,
    articlesParStatut,
    derniersLogs,
    derniersArticles,
  });
}
