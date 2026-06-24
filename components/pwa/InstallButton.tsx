"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Déjà installée
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
      return;
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (ios) { setIsIOS(true); return; }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setPrompt(null);
  };

  if (isStandalone) return null;

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSModal(true)}
          className="flex items-center gap-2 text-[13px] text-[#9E9E9E] hover:text-white transition-colors"
        >
          <span>📱</span> Installer l&apos;app
        </button>

        {showIOSModal && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4" onClick={() => setShowIOSModal(false)}>
            <div className="bg-[#1C1C1E] rounded-2xl p-6 w-full max-w-sm text-white" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-xl bg-[#E53935] flex items-center justify-center mb-4">
                <span className="text-white font-black text-xl">R</span>
              </div>
              <h3 className="text-[17px] font-bold mb-2">Installer Réalitte</h3>
              <p className="text-[14px] text-white/70 mb-4 leading-relaxed">
                Pour ajouter l&apos;application sur votre écran d&apos;accueil :
              </p>
              <ol className="space-y-3 text-[13px] text-white/80">
                <li className="flex items-start gap-2">
                  <span className="bg-[#E53935] text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">1</span>
                  Appuie sur <strong className="text-white mx-1">⎙ Partager</strong> en bas de Safari
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-[#E53935] text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">2</span>
                  Fais défiler et appuie sur <strong className="text-white mx-1">« Sur l&apos;écran d&apos;accueil »</strong>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-[#E53935] text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">3</span>
                  Appuie sur <strong className="text-white mx-1">Ajouter</strong>
                </li>
              </ol>
              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-6 w-full py-3 bg-white/10 text-white text-[14px] font-medium rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (!prompt) return null;

  return (
    <button
      onClick={install}
      className="flex items-center gap-2 text-[13px] text-[#9E9E9E] hover:text-white transition-colors"
    >
      <span>📱</span> Installer l&apos;app
    </button>
  );
}
