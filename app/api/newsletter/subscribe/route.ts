import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // Sauvegarde locale
    await prisma.abonneNewsletter.upsert({
      where: { email },
      update: { actif: true },
      create: { email },
    });

    // Ajout dans Brevo
    const apiKey = process.env.BREVO_API_KEY;
    const listId = process.env.BREVO_LIST_ID ? parseInt(process.env.BREVO_LIST_ID) : null;

    if (apiKey) {
      const body: Record<string, unknown> = {
        email,
        updateEnabled: true,
        attributes: { SOURCE: "site_web" },
      };
      if (listId) body.listIds = [listId];

      await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify(body),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const isDuplicate =
      err instanceof Error && err.message.includes("Unique constraint");
    if (isDuplicate) {
      return NextResponse.json({ ok: true }); // déjà inscrit, pas d'erreur côté UX
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
