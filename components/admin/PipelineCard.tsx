"use client";

import { useState } from "react";

interface PipelineCardProps {
  lastLog: { type: string; message: string; dateCreation: Date } | null;
}

export default function PipelineCard({ lastLog }: PipelineCardProps) {
  const [collectState, setCollectState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [generateState, setGenerateState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [collectMsg, setCollectMsg] = useState("");
  const [generateMsg, setGenerateMsg] = useState("");

  async function runCollect() {
    setCollectState("loading");
    setCollectMsg("");
    try {
      const res = await fetch("/api/admin/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "collect" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setCollectMsg(`${data.collected ?? 0} sources collectées`);
      setCollectState("ok");
    } catch (e) {
      setCollectMsg(e instanceof Error ? e.message : "Erreur");
      setCollectState("error");
    }
  }

  async function runGenerate() {
    setGenerateState("loading");
    setGenerateMsg("");
    try {
      const res = await fetch("/api/admin/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "generate" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setGenerateMsg(`${data.generated ?? 0} article${(data.generated ?? 0) !== 1 ? "s" : ""} générés`);
      setGenerateState("ok");
    } catch (e) {
      setGenerateMsg(e instanceof Error ? e.message : "Erreur");
      setGenerateState("error");
    }
  }

  const lastDate = lastLog
    ? new Date(lastLog.dateCreation).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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

      <div className="p-6 space-y-4">
        {/* Étape 1 : Collecter */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-[#111]">1. Collecter les sources</p>
            <p className="text-[11px] text-[#999]">Récupère les articles RSS</p>
            {collectMsg && (
              <p
                className={`text-[11px] mt-1 font-medium ${
                  collectState === "ok" ? "text-green-600" : "text-[#E53935]"
                }`}
              >
                {collectState === "ok" ? "✓ " : "✕ "}
                {collectMsg}
              </p>
            )}
          </div>
          <button
            onClick={runCollect}
            disabled={collectState === "loading"}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded text-[12px] font-bold transition-all ${
              collectState === "loading"
                ? "bg-[#F5F5F5] text-[#999] cursor-wait"
                : collectState === "ok"
                ? "bg-green-50 text-green-700 border border-green-200"
                : collectState === "error"
                ? "bg-[#FEE2E2] text-[#E53935] border border-[#E53935]/20"
                : "bg-[#111] text-white hover:bg-[#333]"
            }`}
          >
            {collectState === "loading" ? (
              <>
                <Spinner /> Collecte…
              </>
            ) : collectState === "ok" ? (
              "✓ Fait"
            ) : (
              "Collecter"
            )}
          </button>
        </div>

        <div className="border-t border-[#F5F5F5]" />

        {/* Étape 2 : Générer */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-[#111]">2. Générer avec Claude</p>
            <p className="text-[11px] text-[#999]">Rédige les articles + images</p>
            {generateMsg && (
              <p
                className={`text-[11px] mt-1 font-medium ${
                  generateState === "ok" ? "text-green-600" : "text-[#E53935]"
                }`}
              >
                {generateState === "ok" ? "✓ " : "✕ "}
                {generateMsg}
              </p>
            )}
          </div>
          <button
            onClick={runGenerate}
            disabled={generateState === "loading"}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded text-[12px] font-bold transition-all ${
              generateState === "loading"
                ? "bg-[#F5F5F5] text-[#999] cursor-wait"
                : generateState === "ok"
                ? "bg-green-50 text-green-700 border border-green-200"
                : generateState === "error"
                ? "bg-[#FEE2E2] text-[#E53935] border border-[#E53935]/20"
                : "bg-[#E53935] text-white hover:bg-[#c62828]"
            }`}
          >
            {generateState === "loading" ? (
              <>
                <Spinner /> Génère…
              </>
            ) : generateState === "ok" ? (
              "✓ Fait"
            ) : (
              "Générer"
            )}
          </button>
        </div>

        <p className="text-[10px] text-[#ccc] border-t border-[#F5F5F5] pt-3">
          Le pipeline se lance aussi automatiquement tous les jours à 9h
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
