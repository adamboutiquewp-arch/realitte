"use client";

import { useState } from "react";

export default function DeleteArticleButton({ id, titre }: { id: string; titre: string }) {
  const [step, setStep] = useState<"idle" | "confirm" | "loading">("idle");
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setStep("loading");
    setError("");
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Erreur ${res.status}`);
        setStep("idle");
      }
    } catch {
      setError("Erreur réseau");
      setStep("idle");
    }
  };

  if (step === "idle") {
    return (
      <button
        onClick={() => setStep("confirm")}
        className="text-[11px] font-medium text-[#bbb] hover:text-[#E53935] transition-colors"
      >
        Supprimer
      </button>
    );
  }

  if (step === "confirm") {
    return (
      <span className="flex items-center gap-1.5">
        <span className="text-[11px] text-[#555] whitespace-nowrap">Confirmer ?</span>
        <button
          onClick={handleDelete}
          className="text-[11px] font-bold text-white bg-[#E53935] px-2 py-0.5 rounded hover:bg-[#c62828] transition-colors"
        >
          Oui
        </button>
        <button
          onClick={() => setStep("idle")}
          className="text-[11px] text-[#bbb] hover:text-[#555] transition-colors"
        >
          Non
        </button>
        {error && <span className="text-[10px] text-[#E53935]">{error}</span>}
      </span>
    );
  }

  return (
    <span className="text-[11px] text-[#bbb] animate-pulse">Suppression…</span>
  );
}
