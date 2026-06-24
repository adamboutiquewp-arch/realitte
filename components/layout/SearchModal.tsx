"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface SearchResult {
  id: string;
  titre: string;
  slug: string;
  chapo: string;
  categorie: { nom: string; slug: string; couleur: string };
  datePublication: string | null;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults((data || []).slice(0, 5));
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white shadow-2xl">
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E0E0E0]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un article…"
            className="flex-1 text-base outline-none placeholder:text-[#9E9E9E]"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-[#E0E0E0] border-t-[#E53935] rounded-full animate-spin" />
          )}
          <button onClick={onClose} className="text-[#9E9E9E] hover:text-black text-sm font-medium">
            Fermer
          </button>
        </div>

        {/* Résultats */}
        {results.length > 0 && (
          <ul>
            {results.map((article, i) => (
              <li key={article.id} className={i > 0 ? "border-t border-[#F5F5F5]" : ""}>
                <Link
                  href={`/${article.categorie.slug}/${article.slug}`}
                  onClick={onClose}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-[#F5F5F5] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <span
                      className="block text-[11px] font-bold tracking-widest uppercase mb-1"
                      style={{ color: article.categorie.couleur }}
                    >
                      {article.categorie.nom}
                    </span>
                    <p className="font-bold text-sm text-[#111111] line-clamp-1">{article.titre}</p>
                    <p className="text-xs text-[#9E9E9E] mt-0.5 line-clamp-1">{article.chapo}</p>
                  </div>
                  {article.datePublication && (
                    <span className="text-[11px] text-[#9E9E9E] flex-shrink-0 mt-0.5">
                      {formatDate(article.datePublication)}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {query.length >= 2 && !loading && results.length === 0 && (
          <div className="px-5 py-8 text-center text-[#9E9E9E] text-sm">
            Aucun résultat pour &ldquo;{query}&rdquo;
          </div>
        )}

        {results.length > 0 && (
          <div className="px-5 py-3 border-t border-[#F0F0F0]">
            <Link
              href={`/recherche?q=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="text-[12px] font-bold text-[#E53935] hover:underline"
            >
              Voir tous les résultats →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
