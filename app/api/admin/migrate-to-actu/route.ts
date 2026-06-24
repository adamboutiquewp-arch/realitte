import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CATEGORIES_TO_MERGE: Record<string, string> = {
  "economie":        "Économie",
  "people":          "People",
  "sante-beaute":    "Santé & Beauté",
  "success-stories": "Success Stories",
  "fait-divers":     "Fait Divers",
};

export async function POST() {
  const actu = await prisma.categorie.findUnique({ where: { slug: "actu" } });
  if (!actu) {
    return NextResponse.json({ error: "Catégorie 'actu' introuvable" }, { status: 500 });
  }

  let totalMigre = 0;
  const details: Record<string, number> = {};

  for (const [slug, sousCategorie] of Object.entries(CATEGORIES_TO_MERGE)) {
    const categorie = await prisma.categorie.findUnique({ where: { slug } });
    if (!categorie) continue;

    const { count } = await prisma.article.updateMany({
      where: { categorieId: categorie.id },
      data: {
        categorieId: actu.id,
        sousCategorie,
      },
    });

    details[slug] = count;
    totalMigre += count;

    // Supprime la catégorie maintenant qu'elle est vide
    await prisma.sourceBrute.updateMany({
      where: { categorie: slug },
      data: { categorie: "actu" },
    });

    await prisma.categorie.delete({ where: { id: categorie.id } });
  }

  return NextResponse.json({
    ok: true,
    totalMigre,
    details,
    message: `${totalMigre} articles migrés vers actu, catégories supprimées.`,
  });
}
