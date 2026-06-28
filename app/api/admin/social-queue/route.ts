import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const INTERVAL_MINUTES = 15;

function nextSlot(lastDate: Date | null): Date {
  const base = lastDate && lastDate > new Date() ? lastDate : new Date();
  return new Date(base.getTime() + INTERVAL_MINUTES * 60 * 1000);
}

// GET — liste la file d'attente complète
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const [articles, socialPosts] = await Promise.all([
    prisma.article.findMany({
      where: { statut: "PENDING", scheduledFor: { not: null } },
      select: {
        id: true, titre: true, chapo: true, scheduledFor: true,
        categorie: { select: { nom: true, couleur: true } },
      },
      orderBy: { scheduledFor: "asc" },
    }),
    prisma.socialQueueItem.findMany({
      where: { statut: "PENDING" },
      select: {
        id: true, network: true, message: true, scheduledAt: true,
        article: { select: { id: true, titre: true, slug: true, categorie: { select: { slug: true } } } },
      },
      orderBy: { scheduledAt: "asc" },
    }),
  ]);

  return NextResponse.json({ articles, socialPosts });
}

// POST — ajoute à la file
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { type } = body;

  if (type === "article") {
    const { articleId } = body;
    if (!articleId) return NextResponse.json({ error: "articleId requis" }, { status: 400 });

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
    if (article.statut !== "PENDING") return NextResponse.json({ error: "L'article n'est pas en attente" }, { status: 400 });

    // Trouve le dernier créneau occupé
    const last = await prisma.article.findFirst({
      where: { statut: "PENDING", scheduledFor: { not: null } },
      orderBy: { scheduledFor: "desc" },
      select: { scheduledFor: true },
    });

    const slot = nextSlot(last?.scheduledFor ?? null);
    await prisma.article.update({
      where: { id: articleId },
      data: { scheduledFor: slot },
    });

    return NextResponse.json({ ok: true, scheduledFor: slot });
  }

  if (type === "social") {
    const { articleId, network, message, imageUrl } = body;
    if (!articleId || !network || !message) {
      return NextResponse.json({ error: "articleId, network et message requis" }, { status: 400 });
    }
    if (!["facebook", "instagram"].includes(network)) {
      return NextResponse.json({ error: "Réseau non supporté (facebook ou instagram uniquement)" }, { status: 400 });
    }

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

    const last = await prisma.socialQueueItem.findFirst({
      where: { statut: "PENDING" },
      orderBy: { scheduledAt: "desc" },
      select: { scheduledAt: true },
    });

    const slot = nextSlot(last?.scheduledAt ?? null);
    const item = await prisma.socialQueueItem.create({
      data: { articleId, network, message, imageUrl: imageUrl || null, scheduledAt: slot },
    });

    return NextResponse.json({ ok: true, id: item.id, scheduledAt: slot });
  }

  return NextResponse.json({ error: "type invalide (article ou social)" }, { status: 400 });
}

// DELETE — retire un élément de la file
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { type, id } = body;

  if (type === "article") {
    await prisma.article.update({
      where: { id },
      data: { scheduledFor: null },
    });
    return NextResponse.json({ ok: true });
  }

  if (type === "social") {
    await prisma.socialQueueItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "type invalide" }, { status: 400 });
}
