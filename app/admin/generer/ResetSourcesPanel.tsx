"use client";

import { useState } from "react";

interface Categorie { id: string; nom: string; slug: string; couleur: string; }

export default function ResetSourcesPanel({ categories }: { categories: Categorie[] }) {
  const [cat, setCat] = useState("all");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const reset = async () => {
    const label = cat === "all" ? "toutes les catégories" : categories.find((c) => c.slug === cat)?.nom || cat;
    if (!confirm(`Réinitialiser les sources skippées pour : ${label} ?`)) return;
    setLoading(true);
    setMsg("");
    setIsError(false);
    try {
      const slugs = cat === "all" ? categories.map((c) => c.slug) : [cat];
      let total = 0;
      for (const slug of slugs) {
        const res = await fetch("/api/admin/pipeline-reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categorie: slug }),
        });
        const data = await res.json();
        total += data.reset ?? 0;
      }
      setMsg(`✓ ${total} source(s) remises à zéro — relance la collecte`);
    } catch {
      setMsg("✕ Erreur lors de la réinitialisation");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 bg-white rounded-xl border border-[#EBEBEB] p-5">
      <p className="text-[11px] font-bold tracking-wider uppercase text-[#bbb] mb-3">
        Outils pipeline
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={cat}
          onChange={(e) => { setCat(e.target.value); setMsg(""); }}
          className="px-3 py-2 border border-[#E0E0E0] text-[12px] rounded-lg outline-none focus:border-[#111] bg-white"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.nom}</option>
          ))}
        </select>
        <button
          onClick={reset}
          disabled={loading}
          className="px-4 py-2 text-[12px] font-bold rounded-lg border border-[#E0E0E0] text-[#666] hover:text-[#E53935] hover:border-[#E53935] transition-colors disabled:opacity-40"
        >
          {loading ? "Réinitialisation…" : "Réinitialiser les sources skippées"}
        </button>
        {msg && (
          <span className={`text-[12px] font-medium ${isError ? "text-[#E53935]" : "text-green-700"}`}>
            {msg}
          </span>
        )}
      </div>
      <p className="text-[10px] text-[#ccc] mt-2">
        Remet à zéro les sources déjà traitées — utile si la pipeline ne trouve plus de nouvelles sources
      </p>
    </div>
  );
}
