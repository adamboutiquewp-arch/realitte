"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Déjà installée en mode standalone
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Déjà refusé ou installé
    if (localStorage.getItem("pwa-dismissed")) return;

    // iOS (Safari) — pas de beforeinstallprompt
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    if (ios) {
      setIsIOS(true);
      setTimeout(() => setShow(true), 3000);
      return;
    }

    // Android / Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("pwa-dismissed", "1");
  };

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    dismiss();
  };

  if (!show || installed) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-[#111] text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 border border-white/10">
        {/* Icône app */}
        <div className="w-12 h-12 rounded-xl bg-[#E53935] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-xl">R</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-white">Installer l&apos;app Réalitte</p>
          {isIOS ? (
            <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">
              Appuie sur <span className="text-white">⎙ Partager</span> puis{" "}
              <span className="text-white">« Sur l&apos;écran d&apos;accueil »</span>
            </p>
          ) : (
            <p className="text-[11px] text-white/60 mt-0.5">
              Accès rapide, lecture hors-ligne
            </p>
          )}

          {!isIOS && (
            <button
              onClick={install}
              className="mt-2 px-4 py-1.5 bg-[#E53935] text-white text-[11px] font-bold rounded-lg hover:bg-[#c62828] transition-colors"
            >
              Télécharger l&apos;app
            </button>
          )}
        </div>

        <button
          onClick={dismiss}
          className="text-white/40 hover:text-white transition-colors text-lg leading-none mt-0.5 flex-shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
