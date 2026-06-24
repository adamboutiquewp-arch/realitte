import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const {
    titre, chapo, contenu, imageUrl, imageAlt,
    categorieId, sousCategorie, tags, sourceUrl, sourceNom,
    metaTitle, metaDescription, featured, featuredCategorie, statut,
  } = body;

  try {
    const data: Record<string, unknown> = {};
    if (titre !== undefined) data.titre = titre;
    if (chapo !== undefined) data.chapo = chapo;
    if (contenu !== undefined) data.contenu = contenu;
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
    if (imageAlt !== undefined) data.imageAlt = imageAlt || null;
    if (categorieId !== undefined) data.categorieId = categorieId;
    if (sousCategorie !== undefined) data.sousCategorie = sousCategorie || null;
    if (tags !== undefined) data.tags = tags;
    if (sourceUrl !== undefined) data.sourceUrl = sourceUrl;
    if (sourceNom !== undefined) data.sourceNom = sourceNom;
    if (metaTitle !== undefined) data.metaTitle = metaTitle || null;
    if (metaDescription !== undefined) data.metaDescription = metaDescription || null;
    if (featured !== undefined) {
      data.featured = featured;
      if (featured === true) {
        await prisma.article.updateMany({
          where: { featured: true, id: { not: id } },
          data: { featured: false },
        });
      }
    }
    if (featuredCategorie !== undefined) {
      data.featuredCategorie = featuredCategorie;
      if (featuredCategorie === true) {
        // Récupère la catégorie de cet article pour ne décocher que ceux de la même catégorie
        const current = await prisma.article.findUnique({ where: { id }, select: { categorieId: true } });
        if (current) {
          await prisma.article.updateMany({
            where: { featuredCategorie: true, categorieId: current.categorieId, id: { not: id } },
            data: { featuredCategorie: false },
          });
        }
      }
    }

    if (statut !== undefined) {
      data.statut = statut;
      if (statut === "PUBLISHED" && !body.datePublication) {
        data.datePublication = new Date();
      }
    }

    if (contenu) {
      const wordCount = contenu.replace(/<[^>]+>/g, "").split(/\s+/).length;
      data.tempsLecture = Math.max(1, Math.ceil(wordCount / 200));
    }

    const article = await prisma.article.update({
      where: { id },
      data,
      include: { categorie: true },
    });

    return NextResponse.json({ article });
  } catch (error) {
    console.error("PATCH /api/articles/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/articles/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: { categorie: true },
  });

  if (!article) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }

  return NextResponse.json({ article });
}
