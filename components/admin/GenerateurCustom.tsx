"use client";

import { useState } from "react";
import Link from "next/link";

interface Categorie {
  id: string;
  nom: string;
  slug: string;
  couleur: string;
}

const EXEMPLES = [
  "Les meilleurs buteurs de Ligue 1 cette saison",
  "Macron annonce une réforme fiscale",
  "La startup française qui révolutionne l'IA",
  "Mbappé et le Real Madrid : bilan de la première année",
  "Réchauffement climatique : les chiffres alarmants de 2025",
  "Les 10 entrepreneurs français qui font bouger les lignes",
];

export default function GenerateurCustom({ categories }: { categories: Categorie[] }) {
  const [sujet, setSujet] = useState("");
  const [categorieSlug, setCategorieSlug] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [result, setResult] = useState<{ articleId: string; titre: string; slug: string } | null>(null);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!sujet.trim() || state === "loading") return;
    setState("loading");
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/admin/generate-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sujet: sujet.trim(), categorieSlugHint: categorieSlug || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setResult(data);
      setState("ok");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setResult(null);
    setError("");
    setSujet("");
    setCategorieSlug("");
  };

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F0F0F0] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E53935]/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#E53935]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-[14px] font-bold text-[#111]">Nouveau sujet</h2>
            <p className="text-[11px] text-[#bbb]">Claude génère un article de 400-600 mots</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Sujet */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-[#999] mb-2">
              Sujet de l&apos;article *
            </label>
            <textarea
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              placeholder="Ex: Mbappé signe au Real Madrid, les conséquences pour la Ligue 1..."
              rows={3}
              disabled={state === "loading"}
              className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] transition-colors resize-none disabled:opacity-50 disabled:bg-[#F9F9F9]"
            />
            <p className="text-[11px] text-[#bbb] mt-1">
              Plus tu es précis, meilleur sera l&apos;article. Tu peux mentionner des noms, des chiffres, des dates.
            </p>
          </div>

          {/* Catégorie forcée */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-[#999] mb-2">
              Catégorie (optionnel — Claude choisit si tu ne précises pas)
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategorieSlug("")}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                  !categorieSlug
                    ? "bg-[#111] text-white border-[#111]"
                    : "bg-[#F5F5F5] text-[#999] border-[#E8E8E8] hover:border-[#bbb]"
                }`}
              >
                Auto
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategorieSlug(cat.slug)}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all"
                  style={
                    categorieSlug === cat.slug
                      ? { backgroundColor: cat.couleur, color: "#fff", borderColor: cat.couleur }
                      : { backgroundColor: "#F5F5F5", color: "#999", borderColor: "#E8E8E8" }
                  }
                >
                  {cat.nom}
                </button>
              ))}
            </div>
          </div>

          {/* Bouton */}
          <div className="pt-1">
            <button
              onClick={generate}
              disabled={!sujet.trim() || state === "loading"}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-lg text-[13px] font-bold transition-all ${
                state === "loading"
                  ? "bg-[#F5F5F5] text-[#999] cursor-wait"
                  : !sujet.trim()
                  ? "bg-[#F5F5F5] text-[#bbb] cursor-not-allowed"
                  : "bg-[#E53935] text-white hover:bg-[#c62828]"
              }`}
            >
              {state === "loading" ? (
                <>
                  <Spinner />
                  Claude rédige… (10-30 secondes)
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  Générer l&apos;article
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Résultat succès */}
      {state === "ok" && result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-green-800">Article généré avec succès !</p>
              <p className="text-[12px] text-green-700 mt-0.5 line-clamp-2">{result.titre}</p>
              <p className="text-[11px] text-green-600 mt-2">
                L&apos;article est en attente de validation — révise-le et publie-le dans l&apos;éditeur.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <Link
                  href={`/admin/articles/${result.articleId}`}
                  className="px-4 py-2 bg-green-700 text-white text-[12px] font-bold rounded hover:bg-green-800 transition-colors"
                >
                  Éditer et publier →
                </Link>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-white text-green-700 border border-green-200 text-[12px] font-bold rounded hover:bg-green-50 transition-colors"
                >
                  Générer un autre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Erreur */}
      {state === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-[#E53935] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-[13px] text-[#c62828] font-medium">{error}</p>
          <button onClick={() => setState("idle")} className="ml-auto text-[11px] text-[#E53935] font-bold hover:underline">
            Réessayer
          </button>
        </div>
      )}

      {/* Exemples */}
      {state === "idle" && (
        <div className="bg-white rounded-xl border border-[#EBEBEB] p-5">
          <p className="text-[11px] font-bold tracking-wider uppercase text-[#bbb] mb-3">Exemples de sujets</p>
          <div className="flex flex-wrap gap-2">
            {EXEMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setSujet(ex)}
                className="px-3 py-1.5 bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#666] text-[12px] rounded-lg transition-colors text-left"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  );
}
