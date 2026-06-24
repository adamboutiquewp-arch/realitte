import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const NEW_CATEGORIES = [
  { nom: "People",           slug: "people",      couleur: "#E91E63", ordre: 6 },
  { nom: "Santé & Beauté",   slug: "sante-beaute",couleur: "#00897B", ordre: 7 },
  { nom: "Fait Divers",      slug: "fait-divers", couleur: "#455A64", ordre: 8 },
  { nom: "Créateurs",        slug: "createurs",   couleur: "#7C3AED", ordre: 9 },
];

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const results = [];
  for (const cat of NEW_CATEGORIES) {
    const existing = await prisma.categorie.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      results.push({ slug: cat.slug, status: "déjà existante" });
      continue;
    }
    await prisma.categorie.create({ data: cat });
    results.push({ slug: cat.slug, status: "créée" });
  }

  return NextResponse.json({ ok: true, results });
}
