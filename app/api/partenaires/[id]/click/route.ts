import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const slot = await prisma.espacePartenaire.update({
      where: { id },
      data: { clics: { increment: 1 } },
      select: { lien: true },
    });
    return NextResponse.redirect(slot.lien || "/partenaires");
  } catch {
    return NextResponse.redirect("/partenaires");
  }
}
