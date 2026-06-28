"use client";

import { useState } from "react";

const CATEGORIES = [
  { slug: "actu",         label: "Actu",          color: "#E53935" },
  { slug: "sport",        label: "Sport",         color: "#1565C0" },
  { slug: "politique",    label: "Politique",     color: "#6A1B9A" },
  { slug: "createurs",    label: "Créateurs",     color: "#7C3AED" },
  { slug: "ia",           label: "IA",            color: "#0284C7" },
  { slug: "sante-beaute", label: "Santé & Beauté",color: "#00897B" },
];

interface PipelineCardProps {
  lastLog: { type: string; message: string; dateCreation: Date } | null;
}

type StepState = "idle" | "loading" | "ok" | "error";

// categoryConfig : { [slug]: count }
type CategoryConfig = Record<string, number>;

export default function PipelineCard({ lastLog }: PipelineCardProps) {
  // Par défaut : toutes les catégories activées, 3 articles chacune
  const [config, setConfig] = useState<CategoryConfig>(
    Object.fromEntries(CATEGORIES.map((c) => [c.slug, 3]))
  );
  const [collectState, setCollectState] = useState<StepState>("idle");
  const [generateState, setGenerateState] = useState<StepState>("idle");
  const [collectMsg, setCollectMsg] = useState("");
  const [generateMsg, setGenerateMsg] = useState("");

  const selectedSlugs = Object.entries(config)
    .filter(([, count]) => count > 0)
    .map(([slug]) => slug);

  const toggleCat = (slug: string) => {
    setConfig((prev) => ({
      ...prev,
      [slug]: prev[slug] > 0 ? 0 : 3, // 0 = désactivé, 3 = défaut
    }));
  };

  const setCount = (slug: string, value: number) => {
    setConfig((prev) => ({ ...prev, [slug]: Math.max(0, Math.min(20, value)) }));
  };

  const toggleAll = () => {
    const allOn = CATEGORIES.every((c) => config[c.slug] > 0);
    setConfig(
      allOn
        ? Object.fromEntries(CATEGORIES.map((c) => [c.slug, 0]))
        : Object.fromEntries(CATEGORIES.map((c) => [c.slug, config[c.slug] > 0 ? config[c.slug] : 3]))
    );
  };

  const totalArticles = Object.values(config).reduce((s, n) => s + n, 0);

  async function trigger(
    type: "collect" | "generate",
    setState: (s: StepState) => void,
    setMsg: (m: string) => void
  ) {
    if (selectedSlugs.length === 0) return;
    setState("loading");
    setMsg("");
    try {
      const res = await fetch("/api/admin/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          categories: selectedSlugs,
          categoryConfig: config,
        }),
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
        {/* Sélection catégories + quantité */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold tracking-wider uppercase text-[#999]">
              Catégories et nombre d&apos;articles
            </p>
            <button
              onClick={toggleAll}
              className="text-[11px] text-[#bbb] hover:text-[#E53935] font-medium transition-colors"
            >
              {CATEGORIES.every((c) => config[c.slug] > 0) ? "Tout désactiver" : "Tout activer"}
            </button>
          </div>

          <div className="space-y-2">
            {CATEGORIES.map((cat) => {
              const isOn = config[cat.slug] > 0;
              const count = config[cat.slug];
              return (
                <div key={cat.slug} className="flex items-center gap-3">
                  {/* Toggle catégorie */}
                  <button
                    onClick={() => toggleCat(cat.slug)}
                    className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2 rounded-lg border transition-all text-left"
                    style={
                      isOn
                        ? { backgroundColor: `${cat.color}15`, borderColor: cat.color }
                        : { backgroundColor: "#F9F9F9", borderColor: "#E8E8E8" }
                    }
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: isOn ? cat.color : "#ddd" }}
                    />
                    <span
                      className="text-[12px] font-semibold truncate"
                      style={{ color: isOn ? cat.color : "#bbb" }}
                    >
                      {cat.label}
                    </span>
                  </button>

                  {/* Nombre d'articles */}
                  <div className={`flex items-center gap-1 flex-shrink-0 ${!isOn ? "opacity-30 pointer-events-none" : ""}`}>
                    <button
                      onClick={() => setCount(cat.slug, count - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded border border-[#E8E8E8] text-[#666] hover:border-[#111] text-[14px] font-bold transition-colors"
                    >
                      −
                    </button>
                    <span
                      className="w-8 text-center text-[13px] font-black"
                      style={{ color: isOn ? cat.color : "#bbb" }}
                    >
                      {count}
                    </span>
                    <button
                      onClick={() => setCount(cat.slug, count + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded border border-[#E8E8E8] text-[#666] hover:border-[#111] text-[14px] font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalArticles === 0 && (
            <p className="text-[11px] text-[#E53935] mt-2">Sélectionne au moins une catégorie</p>
          )}

          {totalArticles > 0 && (
            <p className="text-[11px] text-[#bbb] mt-2">
              Total : <strong className="text-[#111]">{totalArticles} article{totalArticles > 1 ? "s" : ""}</strong> à générer
            </p>
          )}
        </div>

        <div className="border-t border-[#F5F5F5]" />

        {/* Étape 1 : Collecter */}
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#111]">1. Collecter les sources</p>
            <p className="text-[11px] text-[#999]">
              Récupère les articles RSS des catégories sélectionnées
            </p>
            {collectMsg && (
              <p className={`text-[11px] mt-1 font-medium ${collectState === "ok" ? "text-green-600" : "text-[#E53935]"}`}>
                {collectState === "ok" ? "✓ " : "✕ "}{collectMsg}
              </p>
            )}
          </div>
          <button
            onClick={() => trigger("collect", setCollectState, setCollectMsg)}
            disabled={collectState === "loading" || selectedSlugs.length === 0}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded text-[12px] font-bold transition-all ${
              collectState === "loading"  ? "bg-[#F5F5F5] text-[#999] cursor-wait" :
              collectState === "ok"      ? "bg-green-50 text-green-700 border border-green-200" :
              collectState === "error"   ? "bg-red-50 text-[#E53935] border border-red-200" :
              selectedSlugs.length === 0 ? "bg-[#F5F5F5] text-[#bbb] cursor-not-allowed" :
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
              {totalArticles > 0
                ? `Génère ${totalArticles} article${totalArticles > 1 ? "s" : ""} — ils arrivent dans "À valider"`
                : `Rédige les articles — ils arrivent dans "À valider"`}
            </p>
            {generateMsg && (
              <p className={`text-[11px] mt-1 font-medium ${generateState === "ok" ? "text-green-600" : "text-[#E53935]"}`}>
                {generateState === "ok" ? "✓ " : "✕ "}{generateMsg}
              </p>
            )}
          </div>
          <button
            onClick={() => trigger("generate", setGenerateState, setGenerateMsg)}
            disabled={generateState === "loading" || selectedSlugs.length === 0}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded text-[12px] font-bold transition-all ${
              generateState === "loading" ? "bg-[#F5F5F5] text-[#999] cursor-wait" :
              generateState === "ok"     ? "bg-green-50 text-green-700 border border-green-200" :
              generateState === "error"  ? "bg-red-50 text-[#E53935] border border-red-200" :
              selectedSlugs.length === 0 ? "bg-[#F5F5F5] text-[#bbb] cursor-not-allowed" :
              "bg-[#E53935] text-white hover:bg-[#c62828]"
            }`}
          >
            {generateState === "loading" ? <><Spinner /> Génère…</> :
             generateState === "ok"      ? "✓ Fait" :
             "Générer"}
          </button>
        </div>

        <div className="border-t border-[#F5F5F5] pt-3">
          <p className="text-[10px] text-[#ccc]">
            Le pipeline se lance aussi automatiquement tous les jours à 9h
          </p>
        </div>
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
