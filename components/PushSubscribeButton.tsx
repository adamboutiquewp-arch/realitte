"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function PushSubscribeButton() {
  const [status, setStatus] = useState<"idle" | "subscribed" | "denied" | "unsupported">("idle");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) setStatus("subscribed");
      })
    );
  }, []);

  async function subscribe() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
    });
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    });
    setStatus("subscribed");
  }

  async function unsubscribe() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
    setStatus("idle");
  }

  if (status === "unsupported" || status === "denied") return null;

  if (status === "subscribed") {
    return (
      <button
        onClick={unsubscribe}
        className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold tracking-widest uppercase border border-[#E0E0E0] text-[#9E9E9E] hover:border-[#E53935] hover:text-[#E53935] transition-colors"
      >
        🔔 Notifications activées
      </button>
    );
  }

  return (
    <button
      onClick={subscribe}
      className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold tracking-widest uppercase bg-[#E53935] text-white hover:bg-[#c62828] transition-colors"
    >
      🔔 Recevoir les alertes
    </button>
  );
}
