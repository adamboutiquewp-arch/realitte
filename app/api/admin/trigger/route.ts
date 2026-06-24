import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { type } = await req.json();
  if (type !== "collect" && type !== "generate") {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  }

  const baseUrl = process.env.NEXTAUTH_URL || "https://www.realitte.com";
  const secret = process.env.CRON_SECRET || "";

  try {
    const res = await fetch(`${baseUrl}/api/pipeline/${type}`, {
      headers: { Authorization: `Bearer ${secret}` },
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
