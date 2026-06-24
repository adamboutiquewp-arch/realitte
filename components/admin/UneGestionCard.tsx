"use client";

import { useState } from "react";
import Image from "next/image";

interface ArticleOption {
  id: string;
  titre: string;
  imageUrl?: string | null;
  chapo?: string;
  slug?: string;
  featuredCategorie?: boolean;
}

interface Props {
  type: "global" | "categorie";
  couleur: string;
  nomCategorie: string;
  categorieId: string | null;
  uneArticle: ArticleOption | null;
  articles: ArticleOption[];
}

export default function UneGestionCard({
  type,
  couleur,
  nomCategorie,
  categorieId,
  uneArticle,
  articles,
}: Props) {
  const [current, setCurrent] = useState<ArticleOption | null>(uneArticle);
  const [picking, setPicking] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const setUne = async (article: ArticleOption) => {
    setLoading(article.id);
    try {
      if (type === "global") {
        await fetch(`/api/articles/${article.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ featured: true }),
        });
      } else {
        await fetch(`/api/admin/articles/${article.id}/feature-categorie`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categorieId, active: true }),
        });
      }
      setCurrent(article);
      setPicking(false);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
      {/* Header catégorie */}
      <div
        className="px-5 py-3 flex items-center gap-2.5"
        style={{ backgroundColor: `${couleur}12`, borderBottom: `2px solid ${couleur}30` }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: couleur }}
        />
        <span className="text-[12px] font-black tracking-wider uppercase" style={{ color: couleur }}>
          {nomCategorie}
        </span>
        {!current && (
          <span className="ml-auto text-[10px] font-bold text-[#E53935] bg-red-50 px-2 py-0.5 rounded">
            AUCUNE UNE
          </span>
        )}
        {current && (
          <span className="ml-auto text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
            ✓ DÉFINIE
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Article actuel en une */}
        {current ? (
          <div className="flex items-start gap-3 mb-4">
            {current.imageUrl ? (
              <div className="w-20 h-14 relative rounded overflow-hidden flex-shrink-0">
                <Image
                  src={current.imageUrl}
                  alt={current.titre}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ) : (
              <div className="w-20 h-14 rounded bg-[#F5F5F5] flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-[#111] line-clamp-2 leading-snug">
                {current.titre}
              </p>
              <p className="text-[10px] text-[#bbb] mt-0.5 line-clamp-1">{current.chapo}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-4 p-3 bg-[#FEF2F2] rounded-lg">
            <span className="text-[12px] text-[#c62828]">
              Aucun article sélectionné en une pour cette rubrique.
            </span>
          </div>
        )}

        {/* Bouton changer */}
        {!picking ? (
          <button
            onClick={() => setPicking(true)}
            className="w-full py-2 rounded text-[11px] font-bold border transition-all"
            style={{
              borderColor: couleur,
              color: couleur,
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${couleur}15`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
            }}
          >
            {current ? "Changer la une →" : "Choisir un article →"}
          </button>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold tracking-wider uppercase text-[#999]">
                Choisir un article
              </p>
              <button
                onClick={() => setPicking(false)}
                className="text-[11px] text-[#bbb] hover:text-[#111]"
              >
                Annuler
              </button>
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {articles.length === 0 && (
                <p className="text-[12px] text-[#bbb] py-2 text-center">
                  Aucun article publié dans cette catégorie
                </p>
              )}
              {articles.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setUne(a)}
                  disabled={loading === a.id}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                    current?.id === a.id
                      ? "bg-[#F5F5F5] cursor-default"
                      : "hover:bg-[#F9F9F9] cursor-pointer"
                  }`}
                >
                  {a.imageUrl ? (
                    <div className="w-10 h-7 relative rounded overflow-hidden flex-shrink-0">
                      <Image src={a.imageUrl} alt={a.titre} fill className="object-cover" sizes="40px" />
                    </div>
                  ) : (
                    <div className="w-10 h-7 rounded bg-[#EBEBEB] flex-shrink-0" />
                  )}
                  <span className="text-[11px] text-[#333] line-clamp-2 leading-snug flex-1">
                    {a.titre}
                  </span>
                  {current?.id === a.id ? (
                    <span className="text-[10px] font-bold flex-shrink-0" style={{ color: couleur }}>
                      ✓ En une
                    </span>
                  ) : loading === a.id ? (
                    <Spinner />
                  ) : (
                    <span className="text-[10px] text-[#bbb] flex-shrink-0">Choisir</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin text-[#bbb] flex-shrink-0" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  );
}
