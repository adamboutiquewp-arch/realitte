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
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
      return;
    }
    const mobile = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
    setIsMobile(mobile);
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isStandalone) return null;
  // Sur desktop, on masque
  if (!isMobile && !isIOS) return null;

  const handleClick = async () => {
    if (prompt) {
      await prompt.prompt();
      await prompt.userChoice;
      setPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 text-[13px] text-[#9E9E9E] hover:text-white transition-colors"
      >
        <span>📱</span> Installer l&apos;app
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#1C1C1E] rounded-2xl p-6 w-full max-w-sm text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#E53935] flex items-center justify-center mb-4 mx-auto">
              <span className="text-white font-black text-2xl">R</span>
            </div>
            <h3 className="text-[18px] font-bold mb-1 text-center">Installer Réalitte</h3>
            <p className="text-[13px] text-white/60 text-center mb-5">Ajouter l&apos;app sur votre écran d&apos;accueil</p>

            {isIOS ? (
              <ol className="space-y-4 text-[13px]">
                <li className="flex items-start gap-3">
                  <span className="bg-[#E53935] text-white w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">1</span>
                  <span className="text-white/80">Appuie sur <strong className="text-white">⎙ Partager</strong> en bas de Safari</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-[#E53935] text-white w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">2</span>
                  <span className="text-white/80">Fais défiler et appuie sur <strong className="text-white">« Sur l&apos;écran d&apos;accueil »</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-[#E53935] text-white w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">3</span>
                  <span className="text-white/80">Appuie sur <strong className="text-white">Ajouter</strong> en haut à droite</span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-4 text-[13px]">
                <li className="flex items-start gap-3">
                  <span className="bg-[#E53935] text-white w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">1</span>
                  <span className="text-white/80">Appuie sur les <strong className="text-white">⋮ trois points</strong> en haut à droite de Chrome</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-[#E53935] text-white w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">2</span>
                  <span className="text-white/80">Appuie sur <strong className="text-white">« Ajouter à l&apos;écran d&apos;accueil »</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-[#E53935] text-white w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">3</span>
                  <span className="text-white/80">Appuie sur <strong className="text-white">Ajouter</strong></span>
                </li>
              </ol>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full py-3 bg-white/10 text-white text-[14px] font-medium rounded-xl hover:bg-white/20 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
