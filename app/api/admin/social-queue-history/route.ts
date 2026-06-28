import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const result = await prisma.socialQueueItem.deleteMany({
    where: { statut: { in: ["DONE", "ERROR"] } },
  });

  return NextResponse.json({ ok: true, supprimés: result.count });
}
