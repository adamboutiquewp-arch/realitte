import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.trim()?.toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
    }

    const existing = await prisma.abonneNewsletter.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.actif) {
        return NextResponse.json(
          { message: "Vous êtes déjà inscrit à la newsletter." },
          { status: 200 }
        );
      }
      await prisma.abonneNewsletter.update({
        where: { email },
        data: { actif: true },
      });
    } else {
      await prisma.abonneNewsletter.create({ data: { email } });
    }

    return NextResponse.json(
      { message: "Bienvenue ! Vous êtes inscrit à la newsletter Réalitte." },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/newsletter error:", error);
    return NextResponse.json({ error: "Erreur serveur. Réessayez." }, { status: 500 });
  }
}
