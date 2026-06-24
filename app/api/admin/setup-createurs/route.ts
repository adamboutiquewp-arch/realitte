import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const existing = await prisma.categorie.findUnique({ where: { slug: "createurs" } });
  if (existing) {
    return NextResponse.json({ ok: true, message: "Catégorie déjà existante" });
  }

  await prisma.categorie.create({
    data: { nom: "Créateurs", slug: "createurs", couleur: "#7C3AED", ordre: 9 },
  });

  return NextResponse.json({ ok: true, message: "Catégorie Créateurs créée !" });
}
