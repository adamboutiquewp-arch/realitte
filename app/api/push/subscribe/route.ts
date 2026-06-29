import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { endpoint, keys } = await req.json();
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth },
    update: { p256dh: keys.p256dh, auth: keys.auth },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { endpoint } = await req.json();
  if (!endpoint) return NextResponse.json({ error: "Endpoint manquant" }, { status: 400 });

  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  return NextResponse.json({ ok: true });
}
