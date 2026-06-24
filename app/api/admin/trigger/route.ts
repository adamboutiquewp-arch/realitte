import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { type, categories, categoryConfig } = await req.json();
  if (type !== "collect" && type !== "generate") {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  }

  const baseUrl = process.env.NEXTAUTH_URL || "https://www.realitte.com";
  const secret = process.env.CRON_SECRET || "";

  const url = new URL(`${baseUrl}/api/pipeline/${type}`);
  if (categories && categories.length > 0) {
    url.searchParams.set("categories", categories.join(","));
  }
  // Passe le config détaillé (slug → count) pour la génération
  if (categoryConfig) {
    url.searchParams.set("categoryConfig", JSON.stringify(categoryConfig));
  }

  try {
    const res = await fetch(url.toString(), {
      headers: { "x-cron-secret": secret },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erreur pipeline");
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
