import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { action, categories } = await req.json();
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET manquant" }, { status: 500 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com";
  const headers = { "x-cron-secret": secret };

  try {
    if (action === "collect") {
      const url = categories
        ? `${base}/api/pipeline/collect?categories=${categories}`
        : `${base}/api/pipeline/collect`;
      const res = await fetch(url, { headers });
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === "generate") {
      const url = categories
        ? `${base}/api/pipeline/generate?categories=${categories}`
        : `${base}/api/pipeline/generate`;
      const res = await fetch(url, { headers });
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}
