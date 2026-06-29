import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY!;
const SITE_URL      = (process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com").replace(/\/$/, "");

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(`mailto:contact@realitte.com`, VAPID_PUBLIC, VAPID_PRIVATE);
}

export async function sendPushToAll(title: string, body: string, url: string) {
  const subs = await prisma.pushSubscription.findMany();
  const payload = JSON.stringify({ title, body, url });
  const dead: string[] = [];

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) dead.push(sub.id);
      }
    })
  );

  if (dead.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: dead } } });
  }

  return { sent: subs.length - dead.length, removed: dead.length };
}

export { SITE_URL };
