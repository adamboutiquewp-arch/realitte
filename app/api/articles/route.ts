import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const cat = searchParams.get("cat") || "";
    const statut = searchParams.get("statut") || "PUBLISHED";
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      statut: statut as "PUBLISHED" | "PENDING" | "DRAFT" | "REJECTED",
    };

    if (q) {
      where.OR = [
        { titre: { contains: q, mode: "insensitive" } },
        { chapo: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
      ];
    }

    if (cat) {
      where.categorie = { slug: cat };
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          categorie: { select: { nom: true, slug: true, couleur: true } },
        },
        orderBy: { datePublication: "desc" },
        take: limit,
        skip,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/articles error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
