import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const { categorieId, active } = await req.json();

  if (!categorieId) {
    return NextResponse.json({ error: "categorieId requis" }, { status: 400 });
  }

  if (active) {
    // 1. Retire featuredCategorie de TOUS les articles de CETTE catégorie uniquement
    await prisma.article.updateMany({
      where: {
        categorieId,
        featuredCategorie: true,
        id: { not: id },
      },
      data: { featuredCategorie: false },
    });
  }

  // 2. Met à jour l'article ciblé
  await prisma.article.update({
    where: { id },
    data: { featuredCategorie: active },
  });

  return NextResponse.json({ ok: true });
}
