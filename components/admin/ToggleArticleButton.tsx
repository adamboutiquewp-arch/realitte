"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  statut: string;
}

export default function ToggleArticleButton({ id, statut }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isPublished = statut === "PUBLISHED";

  const toggle = async () => {
    setLoading(true);
    await fetch(`/api/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: isPublished ? "DRAFT" : "PUBLISHED" }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={isPublished ? "Masquer temporairement" : "Republier"}
      className={`px-3 py-1.5 text-[11px] font-bold rounded transition-colors disabled:opacity-50 ${
        isPublished
          ? "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200"
          : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
      }`}
    >
      {loading ? "…" : isPublished ? "⏸ Pause" : "▶ Republier"}
    </button>
  );
}
