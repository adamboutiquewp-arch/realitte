"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteArticleButton({ id, titre }: { id: string; titre: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Supprimer définitivement "${titre}" ?`)) return;
    setLoading(true);
    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Erreur lors de la suppression");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-[11px] font-medium text-[#bbb] hover:text-[#E53935] transition-colors disabled:opacity-50"
    >
      {loading ? "…" : "Supprimer"}
    </button>
  );
}
