import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2) return NextResponse.json([]);

  const articles = await prisma.article.findMany({
    where: {
      statut: "PUBLISHED",
      OR: [
        { titre: { contains: q, mode: "insensitive" } },
        { chapo: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ],
    },
    include: { categorie: true },
    orderBy: { datePublication: "desc" },
    take: 20,
  });

  return NextResponse.json(articles.map((a) => ({
    id: a.id,
    titre: a.titre,
    slug: a.slug,
    chapo: a.chapo,
    imageUrl: a.imageUrl,
    datePublication: a.datePublication,
    categorie: { nom: a.categorie.nom, slug: a.categorie.slug, couleur: a.categorie.couleur },
  })));
}
