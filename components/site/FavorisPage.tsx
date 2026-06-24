"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface SavedArticle {
  id: string;
  titre: string;
  slug: string;
  categorieSlug: string;
  categorieNom: string;
  categorieCouleur: string;
  imageUrl?: string | null;
  chapo?: string;
  savedAt: number;
}

export const FAVORIS_KEY = "realitte_favoris";

export function getFavoris(): SavedArticle[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORIS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleFavori(article: SavedArticle): boolean {
  const current = getFavoris();
  const exists = current.some((a) => a.id === article.id);
  if (exists) {
    localStorage.setItem(FAVORIS_KEY, JSON.stringify(current.filter((a) => a.id !== article.id)));
    return false;
  } else {
    localStorage.setItem(FAVORIS_KEY, JSON.stringify([{ ...article, savedAt: Date.now() }, ...current]));
    return true;
  }
}

export default function FavorisPage() {
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setArticles(getFavoris());
    setLoaded(true);
  }, []);

  const remove = (id: string) => {
    const current = getFavoris().filter((a) => a.id !== id);
    localStorage.setItem(FAVORIS_KEY, JSON.stringify(current));
    setArticles(current);
  };

  if (!loaded) {
    return (
      <div className="container-site py-12 min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E53935] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-site py-8 md:py-12 min-h-[60vh]">
      <div className="mb-8">
        <h1 className="text-[28px] md:text-[36px] font-black tracking-tight uppercase mb-2">
          Mes favoris
        </h1>
        <p className="text-[14px] text-[#9E9E9E]">
          {articles.length === 0
            ? "Aucun article sauvegardé"
            : `${articles.length} article${articles.length > 1 ? "s" : ""} sauvegardé${articles.length > 1 ? "s" : ""}`}
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#bbb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <div>
            <p className="text-[16px] font-bold text-[#111] mb-1">Aucun article sauvegardé</p>
            <p className="text-[13px] text-[#9E9E9E]">
              Appuie sur le ❤ dans un article pour le retrouver ici
            </p>
          </div>
          <Link
            href="/explorer"
            className="px-6 py-3 bg-[#E53935] text-white text-[12px] font-bold tracking-widest uppercase hover:bg-[#c62828] transition-colors"
          >
            Explorer les articles
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-[#F0F0F0]">
          {articles.map((a) => (
            <div key={a.id} className="flex items-start gap-4 py-4">
              {a.imageUrl && (
                <Link href={`/${a.categorieSlug}/${a.slug}`} className="flex-shrink-0">
                  <div className="w-20 h-14 relative rounded overflow-hidden">
                    <Image src={a.imageUrl} alt={a.titre} fill className="object-cover" sizes="80px" />
                  </div>
                </Link>
              )}
              <div className="flex-1 min-w-0">
                <span
                  className="block text-[10px] font-bold tracking-widest uppercase mb-1"
                  style={{ color: a.categorieCouleur }}
                >
                  {a.categorieNom}
                </span>
                <Link href={`/${a.categorieSlug}/${a.slug}`}>
                  <p className="text-[14px] font-bold text-[#111] leading-snug line-clamp-2 hover:text-[#E53935] transition-colors">
                    {a.titre}
                  </p>
                </Link>
              </div>
              <button
                onClick={() => remove(a.id)}
                className="flex-shrink-0 p-2 text-[#bbb] hover:text-[#E53935] transition-colors"
                title="Retirer des favoris"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
