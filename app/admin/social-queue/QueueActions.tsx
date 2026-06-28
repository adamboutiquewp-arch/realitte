"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  variant?: "remove-article" | "remove-social" | "reset-all";
  articleId?: string;
  socialId?: string;
}

export default function QueueActions({ variant, articleId, socialId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const removeArticle = async () => {
    if (!articleId) return;
    setLoading(true);
    await fetch("/api/admin/social-queue", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "article", id: articleId }),
    });
    router.refresh();
    setLoading(false);
  };

  const removeSocial = async () => {
    if (!socialId) return;
    setLoading(true);
    await fetch("/api/admin/social-queue", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "social", id: socialId }),
    });
    router.refresh();
    setLoading(false);
  };

  const resetAll = async () => {
    if (!confirm("Vider toute la file d'attente ?")) return;
    setLoading(true);
    await fetch("/api/admin/social-queue-reset", { method: "DELETE" });
    router.refresh();
    setLoading(false);
  };

  if (variant === "remove-article") {
    return (
      <button
        onClick={removeArticle}
        disabled={loading}
        className="px-2.5 py-1 text-[11px] font-bold rounded text-[#999] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors disabled:opacity-50"
      >
        {loading ? "…" : "Retirer"}
      </button>
    );
  }

  if (variant === "remove-social") {
    return (
      <button
        onClick={removeSocial}
        disabled={loading}
        className="px-2.5 py-1 text-[11px] font-bold rounded text-[#999] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors disabled:opacity-50"
      >
        {loading ? "…" : "Retirer"}
      </button>
    );
  }

  return (
    <button
      onClick={resetAll}
      disabled={loading}
      className="px-4 py-2 text-[12px] font-bold rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {loading ? "Vidage…" : "Vider la file"}
    </button>
  );
}
