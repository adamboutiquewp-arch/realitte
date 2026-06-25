import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const slots = await prisma.espacePartenaire.findMany({
    orderBy: { ordre: "asc" },
  });
  return NextResponse.json({ slots });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const slot = await prisma.espacePartenaire.create({
    data: {
      titre: body.titre || "Partenaire",
      sousTitre: body.sousTitre || "ESPACE PARTENAIRE",
      imageUrl: body.imageUrl || null,
      lien: body.lien || "#",
      ctaTexte: body.ctaTexte || "EN SAVOIR PLUS",
      ordre: body.ordre ?? 0,
      actif: true,
    },
  });
  return NextResponse.json({ slot });
}
