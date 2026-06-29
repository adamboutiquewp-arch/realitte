"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

type Status = "idle" | "loading" | "subscribed" | "denied" | "unsupported" | "error";

export default function PushSubscribeButton() {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) setStatus("subscribed");
        else if (Notification.permission === "denied") setStatus("denied");
      })
    ).catch(() => setStatus("unsupported"));
  }, []);

  async function subscribe() {
    if (!VAPID_PUBLIC) { setStatus("error"); return; }
    setStatus("loading");
    try {
      // Demander la permission explicitement
      const permission = await Notification.requestPermission();
      if (permission === "denied") { setStatus("denied"); return; }
      if (permission !== "granted") { setStatus("idle"); return; }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
      const subJson = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subJson),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      setStatus("subscribed");
    } catch (err) {
      console.error("Push subscribe error:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  async function unsubscribe() {
    setStatus("loading");
    try {
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
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("subscribed"), 3000);
    }
  }

  if (status === "unsupported" || status === "denied") return null;

  if (status === "loading") {
    return (
      <button
        disabled
        aria-label="Chargement…"
        className="flex items-center justify-center w-9 h-9 rounded-full bg-[#E53935] text-white opacity-60"
      >
        ⏳
      </button>
    );
  }

  if (status === "error") {
    return (
      <button
        disabled
        aria-label="Erreur"
        className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-400 text-white"
        title="Erreur — réessayer"
      >
        ⚠️
      </button>
    );
  }

  if (status === "subscribed") {
    return (
      <button
        onClick={unsubscribe}
        aria-label="Désactiver les notifications"
        className="flex items-center justify-center w-9 h-9 rounded-full bg-[#E53935] text-white"
        title="Notifications activées — appuyer pour désactiver"
      >
        🔔
      </button>
    );
  }

  return (
    <button
      onClick={subscribe}
      aria-label="Recevoir les alertes"
      className="flex items-center justify-center w-9 h-9 rounded-full bg-[#E53935] text-white hover:bg-[#c62828] transition-colors active:scale-95"
      title="Recevoir les alertes"
    >
      🔔
    </button>
  );
}
