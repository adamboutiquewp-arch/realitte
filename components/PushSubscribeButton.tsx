"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "").trim();

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

type Status = "idle" | "confirm" | "loading" | "subscribed" | "denied" | "unsupported" | "error";

export default function PushSubscribeButton() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) =>
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setStatus("subscribed");
          else if (Notification.permission === "denied") setStatus("denied");
        })
      )
      .catch(() => setStatus("unsupported"));
  }, []);

  async function doSubscribe() {
    setStatus("loading");
    try {
      if (!VAPID_PUBLIC) throw new Error("Clé VAPID manquante côté client");

      // Vérifier que le SW est enregistré
      if (!("serviceWorker" in navigator)) throw new Error("Service Worker non supporté");
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Service Worker timeout (10s)")), 10000)),
      ]);

      // Demander la permission
      const permission = await Notification.requestPermission();
      if (permission === "denied") { setStatus("denied"); return; }
      if (permission !== "granted") { setStatus("idle"); return; }

      // S'abonner au push
      const sub = await (reg as ServiceWorkerRegistration).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });

      // Envoyer au serveur
      const subJson = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subJson),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erreur serveur ${res.status}: ${text}`);
      }
      setStatus("subscribed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Push subscribe error:", msg);
      setErrorMsg(msg);
      setStatus("error");
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
      setStatus("subscribed");
    }
  }

  if (status === "unsupported") return null;

  return (
    <>
      {/* Bouton cloche */}
      {status === "loading" ? (
        <button disabled aria-label="Chargement…"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-[#E53935] text-white opacity-60">
          ⏳
        </button>
      ) : status === "denied" ? (
        <button disabled aria-label="Notifications bloquées"
          title="Notifications bloquées dans les paramètres du navigateur"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-300 text-white">
          🔕
        </button>
      ) : status === "error" ? (
        <button onClick={() => { setStatus("idle"); setErrorMsg(""); }} aria-label="Erreur — appuyer pour réessayer"
          title={errorMsg}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-500 text-white">
          ⚠️
        </button>
      ) : status === "subscribed" ? (
        <button onClick={unsubscribe} aria-label="Désactiver les notifications"
          title="Notifications activées — appuyer pour désactiver"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-green-600 text-white">
          🔔
        </button>
      ) : (
        <button onClick={() => setStatus("confirm")} aria-label="Recevoir les alertes"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-[#E53935] text-white hover:bg-[#c62828] transition-colors active:scale-95">
          🔔
        </button>
      )}

      {/* Message d'erreur sous le bouton */}
      {status === "error" && errorMsg && (
        <div className="fixed bottom-4 left-4 right-4 z-[999] bg-red-600 text-white text-[12px] p-3 rounded-xl shadow-xl">
          ❌ {errorMsg}
        </div>
      )}

      {/* Modal de confirmation */}
      {status === "confirm" && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-5">
            <div className="text-5xl">🔔</div>
            <div className="text-center">
              <p className="text-[18px] font-bold text-[#111] mb-2">Activer les notifications</p>
              <p className="text-[14px] text-[#666] leading-relaxed">
                Recevez une alerte sur votre téléphone dès qu'un nouvel article est publié sur Réalitte.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => setStatus("idle")}
                className="flex-1 py-3 rounded-xl border border-[#E0E0E0] text-[14px] font-semibold text-[#666] hover:bg-[#F5F5F5] transition-colors">
                Annuler
              </button>
              <button onClick={doSubscribe}
                className="flex-1 py-3 rounded-xl bg-[#E53935] text-white text-[14px] font-bold hover:bg-[#c62828] transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
