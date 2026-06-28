import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const [articles, socialPosts] = await Promise.all([
    prisma.article.updateMany({
      where: { statut: "PENDING", scheduledFor: { not: null } },
      data: { scheduledFor: null },
    }),
    prisma.socialQueueItem.deleteMany({ where: { statut: "PENDING" } }),
  ]);

  return NextResponse.json({ ok: true, articlesRetires: articles.count, postsRetires: socialPosts.count });
}
