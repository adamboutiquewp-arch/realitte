import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const slot = await prisma.espacePartenaire.update({
    where: { id },
    data: {
      ...(body.titre !== undefined && { titre: body.titre }),
      ...(body.sousTitre !== undefined && { sousTitre: body.sousTitre }),
      ...("imageUrl" in body && { imageUrl: body.imageUrl ?? null }),
      ...(body.lien !== undefined && { lien: body.lien }),
      ...(body.ctaTexte !== undefined && { ctaTexte: body.ctaTexte }),
      ...(body.actif !== undefined && { actif: body.actif }),
      ...(body.padding !== undefined && { padding: Number(body.padding) }),
    },
  });
  return NextResponse.json({ slot });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  await prisma.espacePartenaire.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
