import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const cat = await prisma.categorie.findUnique({ where: { slug: "anecdote" } });
  if (!cat) return NextResponse.json({ message: "Catégorie Anecdote introuvable (déjà supprimée ?)" });

  // Supprime tous les articles liés
  const { count: articlesSupprimes } = await prisma.article.deleteMany({
    where: { categorieId: cat.id },
  });

  // Supprime les sources brutes liées
  const { count: sourcesSupprimes } = await prisma.sourceBrute.deleteMany({
    where: { categorie: "anecdote" },
  });

  // Supprime la catégorie
  await prisma.categorie.delete({ where: { id: cat.id } });

  return NextResponse.json({
    ok: true,
    articlesSupprimes,
    sourcesSupprimes,
    message: `Catégorie Anecdote supprimée. ${articlesSupprimes} article(s) et ${sourcesSupprimes} source(s) effacés.`,
  });
}
