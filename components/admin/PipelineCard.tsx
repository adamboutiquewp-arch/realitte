"use client";

import { useState } from "react";

const CATEGORIES = [
  { slug: "actu",            label: "Actu",            color: "#E53935" },
  { slug: "sport",           label: "Sport",           color: "#1565C0" },
  { slug: "economie",        label: "Économie",        color: "#2E7D32" },
  { slug: "politique",       label: "Politique",       color: "#6A1B9A" },
  { slug: "anecdote",        label: "Anecdote",        color: "#C9A84C" },
  { slug: "success-stories", label: "Success Stories", color: "#00838F" },
];

interface PipelineCardProps {
  lastLog: { type: string; message: string; dateCreation: Date } | null;
}

type StepState = "idle" | "loading" | "ok" | "error";

export default function PipelineCard({ lastLog }: PipelineCardProps) {
  const [selected, setSelected] = useState<string[]>(CATEGORIES.map((c) => c.slug));
  const [collectState, setCollectState] = useState<StepState>("idle");
  const [generateState, setGenerateState] = useState<StepState>("idle");
  const [collectMsg, setCollectMsg] = useState("");
  const [generateMsg, setGenerateMsg] = useState("");

  const toggleCat = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleAll = () => {
    setSelected(selected.length === CATEGORIES.length ? [] : CATEGORIES.map((c) => c.slug));
  };

  async function trigger(type: "collect" | "generate", setState: (s: StepState) => void, setMsg: (m: string) => void) {
    setState("loading");
    setMsg("");
    try {
      const res = await fetch("/api/admin/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, categories: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      if (type === "collect") {
        setMsg(`${data.collected ?? 0} sources collectées${data.skipped ? ` (${data.skipped} doublons)` : ""}`);
      } else {
        setMsg(`${data.generated ?? 0} article${(data.generated ?? 0) !== 1 ? "s" : ""} générés`);
      }
      setState("ok");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur");
      setState("error");
    }
  }

  const lastDate = lastLog
    ? new Date(lastLog.dateCreation).toLocaleString("fr-FR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#F0F0F0]">
        <h2 className="text-[14px] font-bold text-[#111]">Pipeline IA</h2>
        <p className="text-[11px] text-[#bbb] mt-0.5">
          {lastDate ? `Dernière exécution : ${lastDate}` : "Jamais exécuté"}
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Sélection des catégories */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-bold tracking-wider uppercase text-[#999]">
              Catégories à générer
            </p>
            <button
              onClick={toggleAll}
              className="text-[11px] text-[#bbb] hover:text-[#E53935] font-medium transition-colors"
            >
              {selected.length === CATEGORIES.length ? "Tout désélectionner" : "Tout sélectionner"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isOn = selected.includes(cat.slug);
              return (
                <button
                  key={cat.slug}
                  onClick={() => toggleCat(cat.slug)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                    isOn
                      ? "text-white border-transparent"
                      : "bg-[#F5F5F5] text-[#bbb] border-[#E8E8E8] hover:border-current"
                  }`}
                  style={isOn ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
          {selected.length === 0 && (
            <p className="text-[11px] text-[#E53935] mt-1.5">Sélectionne au moins une catégorie</p>
          )}
        </div>

        <div className="border-t border-[#F5F5F5]" />

        {/* Étape 1 : Collecter */}
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#111]">1. Collecter les sources</p>
            <p className="text-[11px] text-[#999]">
              Récupère les articles RSS des thèmes sélectionnés
            </p>
            {collectMsg && (
              <p className={`text-[11px] mt-1 font-medium ${collectState === "ok" ? "text-green-600" : "text-[#E53935]"}`}>
                {collectState === "ok" ? "✓ " : "✕ "}{collectMsg}
              </p>
            )}
          </div>
          <button
            onClick={() => trigger("collect", setCollectState, setCollectMsg)}
            disabled={collectState === "loading" || selected.length === 0}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded text-[12px] font-bold transition-all ${
              collectState === "loading"  ? "bg-[#F5F5F5] text-[#999] cursor-wait" :
              collectState === "ok"      ? "bg-green-50 text-green-700 border border-green-200" :
              collectState === "error"   ? "bg-red-50 text-[#E53935] border border-red-200" :
              selected.length === 0      ? "bg-[#F5F5F5] text-[#bbb] cursor-not-allowed" :
              "bg-[#111] text-white hover:bg-[#333]"
            }`}
          >
            {collectState === "loading" ? <><Spinner /> Collecte…</> :
             collectState === "ok"      ? "✓ Fait" :
             "Collecter"}
          </button>
        </div>

        <div className="border-t border-[#F5F5F5]" />

        {/* Étape 2 : Générer */}
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#111]">2. Générer avec Claude</p>
            <p className="text-[11px] text-[#999]">
              Rédige les articles avec images — ils arrivent dans "À valider"
            </p>
            {generateMsg && (
              <p className={`text-[11px] mt-1 font-medium ${generateState === "ok" ? "text-green-600" : "text-[#E53935]"}`}>
                {generateState === "ok" ? "✓ " : "✕ "}{generateMsg}
              </p>
            )}
          </div>
          <button
            onClick={() => trigger("generate", setGenerateState, setGenerateMsg)}
            disabled={generateState === "loading" || selected.length === 0}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded text-[12px] font-bold transition-all ${
              generateState === "loading" ? "bg-[#F5F5F5] text-[#999] cursor-wait" :
              generateState === "ok"     ? "bg-green-50 text-green-700 border border-green-200" :
              generateState === "error"  ? "bg-red-50 text-[#E53935] border border-red-200" :
              selected.length === 0      ? "bg-[#F5F5F5] text-[#bbb] cursor-not-allowed" :
              "bg-[#E53935] text-white hover:bg-[#c62828]"
            }`}
          >
            {generateState === "loading" ? <><Spinner /> Génère…</> :
             generateState === "ok"      ? "✓ Fait" :
             "Générer"}
          </button>
        </div>

        <p className="text-[10px] text-[#ccc] border-t border-[#F5F5F5] pt-3">
          Le pipeline se lance aussi automatiquement tous les jours à 9h (toutes catégories)
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  );
}
