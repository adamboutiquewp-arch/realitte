"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QueueArticleButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const addToQueue = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/social-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "article", articleId: id }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setDone(true);
      router.refresh();
    }
    setLoading(false);
  };

  if (done) {
    return (
      <span className="px-3 py-1.5 text-[11px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
        ✓ En file
      </span>
    );
  }

  return (
    <button
      onClick={addToQueue}
      disabled={loading}
      title="Ajouter à la file de publication"
      className="px-3 py-1.5 text-[11px] font-bold rounded transition-colors disabled:opacity-50 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
    >
      {loading ? "…" : "⏱ File"}
    </button>
  );
}
