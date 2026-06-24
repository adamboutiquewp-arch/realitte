"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PROFIL_KEY = "realitte_profil";

interface Profil {
  prenom: string;
  email: string;
}

const CATEGORIES = [
  { nom: "Actu",           slug: "actu",            couleur: "#E53935" },
  { nom: "Sport",          slug: "sport",           couleur: "#1565C0" },
  { nom: "Économie",       slug: "economie",        couleur: "#2E7D32" },
  { nom: "Politique",      slug: "politique",       couleur: "#6A1B9A" },
  { nom: "People",         slug: "people",          couleur: "#E91E63" },
  { nom: "Santé & Beauté", slug: "sante-beaute",    couleur: "#00897B" },
  { nom: "Fait Divers",    slug: "fait-divers",     couleur: "#455A64" },
  { nom: "Success Stories",slug: "success-stories", couleur: "#00838F" },
];

export default function ProfilClient() {
  const [profil, setProfil] = useState<Profil | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROFIL_KEY);
      if (stored) setProfil(JSON.parse(stored));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  const creerEspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prenom.trim()) return;
    setSaving(true);
    const data: Profil = { prenom: prenom.trim(), email: email.trim() };
    localStorage.setItem(PROFIL_KEY, JSON.stringify(data));
    setProfil(data);
    // Déclenche la mise à jour du BottomNav
    window.dispatchEvent(new Event("realitte-profil-updated"));
    setSaving(false);
  };

  const supprimerProfil = () => {
    localStorage.removeItem(PROFIL_KEY);
    setProfil(null);
    window.dispatchEvent(new Event("realitte-profil-updated"));
  };

  if (!loaded) {
    return (
      <div className="container-site py-12 min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E53935] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Pas de profil → formulaire de création ──────────────────
  if (!profil) {
    return (
      <div className="container-site py-12 min-h-[70vh]">
        <div className="max-w-sm mx-auto">
          {/* Icône */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#bbb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h1 className="text-[22px] font-black text-[#111] mb-1">Crée ton espace</h1>
            <p className="text-[13px] text-[#9E9E9E] leading-relaxed">
              Sauvegarde tes articles, accède à tes favoris et personnalise ton expérience.
            </p>
          </div>

          <form onSubmit={creerEspace} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-[#666] mb-1.5">
                Prénom *
              </label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Ton prénom"
                required
                className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg text-[14px] focus:outline-none focus:border-[#E53935] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-[#666] mb-1.5">
                Email <span className="font-normal text-[#bbb]">(optionnel)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.fr"
                className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg text-[14px] focus:outline-none focus:border-[#E53935] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !prenom.trim()}
              className="w-full py-3.5 bg-[#E53935] text-white text-[12px] font-bold tracking-widest uppercase hover:bg-[#c62828] transition-colors disabled:opacity-40 rounded-lg"
            >
              {saving ? "Création…" : "Créer mon espace →"}
            </button>
          </form>

          <p className="text-[11px] text-[#bbb] text-center mt-4">
            Tes données restent sur ton téléphone uniquement.
          </p>
        </div>
      </div>
    );
  }

  // ── Profil existant ─────────────────────────────────────────
  const initiale = profil.prenom.charAt(0).toUpperCase();

  return (
    <div className="container-site py-8 md:py-12 min-h-[70vh]">
      <div className="max-w-md mx-auto">
        {/* Avatar */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-[#E53935] flex items-center justify-center mb-4">
            <span className="text-[32px] font-black text-white">{initiale}</span>
          </div>
          <h1 className="text-[22px] font-black text-[#111]">Bonjour {profil.prenom} 👋</h1>
          {profil.email && (
            <p className="text-[13px] text-[#9E9E9E] mt-1">{profil.email}</p>
          )}
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
        <div className="mb-10">
          <p className="text-[11px] font-bold tracking-wider uppercase text-[#bbb] mb-3">Rubriques</p>
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

        {/* Supprimer */}
        <button
          onClick={supprimerProfil}
          className="w-full py-3 text-[12px] text-[#bbb] hover:text-[#E53935] transition-colors border border-[#F0F0F0] rounded-xl"
        >
          Supprimer mon espace
        </button>
      </div>
    </div>
  );
}
