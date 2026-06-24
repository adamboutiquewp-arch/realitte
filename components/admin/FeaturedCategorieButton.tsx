"use client";

import { useState } from "react";

export default function FeaturedCategorieButton({
  id,
  featuredCategorie,
  categorieNom,
  categorieColor,
}: {
  id: string;
  featuredCategorie: boolean;
  categorieNom: string;
  categorieColor: string;
}) {
  const [active, setActive] = useState(featuredCategorie);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featuredCategorie: !active }),
      });
      if (res.ok) {
        setActive((v) => !v);
        if (!active) window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={active ? `Retirer de la une ${categorieNom}` : `Une de ${categorieNom}`}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold transition-all disabled:opacity-50"
      style={
        active
          ? { backgroundColor: categorieColor, color: "#fff" }
          : { backgroundColor: "#F5F5F5", color: "#bbb" }
      }
    >
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      {active ? `Une ${categorieNom}` : `Une ${categorieNom}`}
    </button>
  );
}
