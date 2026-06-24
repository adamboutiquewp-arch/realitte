import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Mon profil — Réalitte" };

const CATEGORIES = [
  { nom: "Actu",           slug: "actu",            couleur: "#E53935" },
  { nom: "Sport",          slug: "sport",           couleur: "#1565C0" },
  { nom: "Économie",       slug: "economie",        couleur: "#2E7D32" },
  { nom: "Politique",      slug: "politique",       couleur: "#6A1B9A" },
  { nom: "Success Stories",slug: "success-stories", couleur: "#00838F" },
];

export default function ProfilPage() {
  return (
    <div className="container-site py-8 md:py-12 min-h-[70vh]">
      <div className="max-w-md mx-auto">
        {/* Avatar */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-[#E53935] flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 className="text-[22px] font-black text-[#111]">Mon espace</h1>
          <p className="text-[13px] text-[#9E9E9E] mt-1">Réalitte — Lecteur</p>
        </div>

        {/* Liens rapides */}
        <div className="space-y-3 mb-10">
          <Link
            href="/favoris"
            className="flex items-center gap-4 p-4 bg-white border border-[#E8E8E8] rounded-xl hover:border-[#111] transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-[#FEE2E2] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#E53935]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#111]">Mes favoris</p>
              <p className="text-[12px] text-[#9E9E9E]">Articles sauvegardés</p>
            </div>
            <span className="ml-auto text-[#bbb]">→</span>
          </Link>

          <Link
            href="/newsletter"
            className="flex items-center gap-4 p-4 bg-white border border-[#E8E8E8] rounded-xl hover:border-[#111] transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#111]">Newsletter</p>
              <p className="text-[12px] text-[#9E9E9E]">Recevoir l&apos;actu chaque matin</p>
            </div>
            <span className="ml-auto text-[#bbb]">→</span>
          </Link>

          <Link
            href="/explorer"
            className="flex items-center gap-4 p-4 bg-white border border-[#E8E8E8] rounded-xl hover:border-[#111] transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-[#F0F0F0] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#424242]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#111]">Explorer</p>
              <p className="text-[12px] text-[#9E9E9E]">Toutes les rubriques</p>
            </div>
            <span className="ml-auto text-[#bbb]">→</span>
          </Link>
        </div>

        {/* Rubriques */}
        <div>
          <p className="text-[11px] font-bold tracking-wider uppercase text-[#bbb] mb-3">
            Rubriques
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[#E8E8E8] hover:border-current transition-colors text-[13px] font-bold"
                style={{ color: cat.couleur }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.couleur }} />
                {cat.nom}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
