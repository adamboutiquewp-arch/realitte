import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildFbText, nextSlot, getLatestSlotMs, INTERVAL_MINUTES } from "@/lib/social-posting";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const articles = await prisma.article.findMany({
    where: { statut: "PUBLISHED" },
    include: { categorie: { select: { slug: true } } },
    orderBy: { datePublication: "asc" },
  });

  if (articles.length === 0) {
    return NextResponse.json({ queued: 0, message: "Aucun article publié trouvé" });
  }

  let slotMs = await getLatestSlotMs();
  const items = articles.map((article) => {
    slotMs = Math.max(slotMs, Date.now()) + INTERVAL_MINUTES * 60 * 1000;
    const message = buildFbText(
      article.titre,
      article.chapo,
      article.slug,
      article.categorie.slug,
      article.tags,
    );
    return {
      articleId: article.id,
      network: "facebook",
      message,
      imageUrl: article.imageUrl,
      scheduledAt: new Date(slotMs),
    };
  });

  await prisma.socialQueueItem.createMany({ data: items });

  const firstSlot = items[0].scheduledAt;
  const lastSlot  = items[items.length - 1].scheduledAt;

  return NextResponse.json({
    queued: items.length,
    premier: firstSlot.toLocaleString("fr-FR"),
    dernier: lastSlot.toLocaleString("fr-FR"),
  });
}
