import type { Metadata } from "next";
import Newsletter from "@/components/home/Newsletter";

export const metadata: Metadata = {
  title: "Newsletter — Réalitte",
  description: "Reçois chaque matin l'essentiel de l'actualité directement dans ta boîte mail.",
};

export default function NewsletterPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-3 py-1.5 bg-[#C9A84C] mb-5">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-black">
              Newsletter
            </span>
          </div>
          <h1 className="text-[28px] md:text-[36px] font-black tracking-tight leading-tight mb-3">
            L&apos;actu qui compte.<br />
            <span className="text-[#E53935]">Chaque matin.</span>
          </h1>
          <p className="text-[14px] text-[#9E9E9E] leading-relaxed">
            Les infos essentielles, le sport, l&apos;économie, les success stories —
            sélectionnés pour toi, sans bruit.
          </p>
        </div>

        {/* Avantages */}
        <div className="flex flex-col gap-3 mb-8">
          {[
            "📰  Actu du jour synthétisée en 5 points",
            "⚡  Envoyée à 7h, avant que ta journée commence",
            "🚫  Zéro spam, désinscription en 1 clic",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-[13px] text-[#424242]">
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Formulaire */}
        <div className="bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm">
          <Newsletter />
        </div>

        <p className="text-center text-[11px] text-[#bbb] mt-4">
          Déjà plus de 1 000 lecteurs · Gratuit
        </p>
      </div>
    </div>
  );
}
