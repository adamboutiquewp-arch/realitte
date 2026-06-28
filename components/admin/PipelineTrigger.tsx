"use client";

import { useState } from "react";

interface Categorie {
  id: string;
  nom: string;
  slug: string;
  couleur: string;
}

export default function PipelineTrigger({ categories }: { categories: Categorie[] }) {
  const [cat, setCat] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState<"collect" | "generate" | "ia-collect" | "ia-generate" | null>(null);

  const run = async (action: "collect" | "generate", forceCat?: string) => {
    const actionKey = forceCat === "ia" ? (action === "collect" ? "ia-collect" : "ia-generate") : action;
    setLoading(actionKey as typeof loading);
    const usedCat = forceCat ?? cat;
    setLog((l) => [...l, `→ ${action === "collect" ? "Collecte" : "Génération"} en cours${usedCat ? ` (${usedCat})` : " (toutes catégories)"}...`]);
    try {
      const res = await fetch("/api/admin/pipeline-trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, categories: usedCat || undefined }),
      });
      const data = await res.json();
      if (action === "collect") {
        setLog((l) => [...l, `✓ Collecte : ${data.collected ?? 0} nouvelles sources, ${data.skipped ?? 0} doublons`]);
        if (data.errors?.length) data.errors.forEach((e: string) => setLog((l) => [...l, `⚠ ${e}`]));
      } else {
        setLog((l) => [...l, `✓ Génération : ${data.generated ?? 0} articles créés`]);
        if (data.errors?.length) data.errors.forEach((e: string) => setLog((l) => [...l, `⚠ ${e}`]));
      }
    } catch {
      setLog((l) => [...l, "✗ Erreur réseau"]);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Pipeline IA dédié */}
      <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
          <h2 className="text-[15px] font-black uppercase tracking-wider text-[#0284C7]">Pipeline IA</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#0284C7] text-white rounded-full">72h</span>
        </div>
        <p className="text-[11px] text-[#0369A1] mb-4">Remonte jusqu&apos;à 72h en arrière · Sources spécialisées IA uniquement</p>
        <div className="flex gap-3">
          <button
            onClick={() => run("collect", "ia")}
            disabled={loading !== null}
            className="px-5 py-2.5 bg-[#0284C7] text-white text-[12px] font-bold tracking-wider uppercase hover:bg-[#0369A1] transition-colors disabled:opacity-40"
          >
            {loading === "ia-collect" ? "Collecte IA…" : "1. Collecter IA"}
          </button>
          <button
            onClick={() => run("generate", "ia")}
            disabled={loading !== null}
            className="px-5 py-2.5 bg-[#0369A1] text-white text-[12px] font-bold tracking-wider uppercase hover:bg-[#075985] transition-colors disabled:opacity-40"
          >
            {loading === "ia-generate" ? "Génération IA…" : "2. Générer IA"}
          </button>
        </div>
      </div>

      {/* Pipeline général */}
      <div className="bg-white border border-[#E0E0E0] p-6">
        <h2 className="text-[15px] font-black uppercase tracking-wider mb-1">Pipeline RSS général</h2>
        <p className="text-[11px] text-[#999] mb-4">Remonte 10h en arrière · Toutes les autres catégories</p>

        {/* Filtre catégorie */}
        <div className="mb-4">
          <label className="text-[11px] font-bold tracking-widest uppercase text-[#999] block mb-1.5">
            Catégorie (optionnel)
          </label>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-[#E0E0E0] text-[13px] outline-none focus:border-black"
          >
            <option value="">Toutes les catégories</option>
            {categories.filter((c) => c.slug !== "ia").map((c) => (
              <option key={c.id} value={c.slug}>{c.nom}</option>
            ))}
          </select>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={() => run("collect")}
            disabled={loading !== null}
            className="px-5 py-2.5 bg-[#111] text-white text-[12px] font-bold tracking-wider uppercase hover:bg-[#333] transition-colors disabled:opacity-40"
          >
            {loading === "collect" ? "Collecte…" : "1. Collecter les RSS"}
          </button>
          <button
            onClick={() => run("generate")}
            disabled={loading !== null}
            className="px-5 py-2.5 bg-[#E53935] text-white text-[12px] font-bold tracking-wider uppercase hover:bg-[#C62828] transition-colors disabled:opacity-40"
          >
            {loading === "generate" ? "Génération…" : "2. Générer les articles"}
          </button>
        </div>
      </div>

      {/* Log commun */}
      {log.length > 0 && (
        <div className="bg-[#F9F9F9] border border-[#E0E0E0] p-4 font-mono text-[12px] space-y-1 max-h-48 overflow-y-auto">
          {log.map((line, i) => (
            <p key={i} className={line.startsWith("✗") || line.startsWith("⚠") ? "text-red-600" : line.startsWith("✓") ? "text-green-700" : "text-[#666]"}>
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
