import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "URL manquante" }, { status: 400 });
  }

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: "Impossible de télécharger l'image" }, { status: 500 });
  }

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buffer = await res.arrayBuffer();
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="realitte-article.${ext}"`,
    },
  });
}
