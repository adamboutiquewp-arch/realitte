import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendPushToAll } from "@/lib/push-notifications";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const subs = await prisma.pushSubscription.findMany({
    select: { id: true, endpoint: true, createdAt: true },
  });

  return NextResponse.json({
    count: subs.length,
    subscriptions: subs.map((s) => ({
      id: s.id,
      endpoint: s.endpoint.slice(0, 60) + "…",
      createdAt: s.createdAt,
    })),
    vapidPublic: process.env.VAPID_PUBLIC_KEY ? "✓ défini" : "✗ MANQUANT",
    vapidPrivate: process.env.VAPID_PRIVATE_KEY ? "✓ défini" : "✗ MANQUANT",
    nextPublicVapid: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? "✓ défini" : "✗ MANQUANT",
  });
}

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const result = await sendPushToAll(
    "🔔 Test Réalitte",
    "Si tu vois ce message, les notifications fonctionnent !",
    "https://realitte.com"
  );

  return NextResponse.json(result);
}
