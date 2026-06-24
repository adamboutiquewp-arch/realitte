"use client";

import { useState } from "react";

export default function FeaturedButton({
  id,
  featured,
}: {
  id: string;
  featured: boolean;
}) {
  const [active, setActive] = useState(featured);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !active }),
      });
      if (res.ok) {
        setActive((v) => !v);
        // Recharge pour refléter le changement sur toute la liste
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
      title={active ? "Retirer de la une" : "Mettre en une"}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold transition-all ${
        active
          ? "bg-[#C9A84C] text-white"
          : "bg-[#F5F5F5] text-[#bbb] hover:bg-[#C9A84C]/10 hover:text-[#C9A84C]"
      } disabled:opacity-50`}
    >
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      {active ? "En une" : "Une"}
    </button>
  );
}
