"use client";

import { useState } from "react";

interface Props {
  articleId: string;
  variant?: "list" | "editor";
}

export default function FacebookPostButton({ articleId, variant = "list" }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const post = async () => {
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/facebook/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setState("success");
        setTimeout(() => setState("idle"), 4000);
      } else {
        setErrorMsg(data.error || "Erreur inconnue");
        setState("error");
        setTimeout(() => setState("idle"), 6000);
      }
    } catch {
      setErrorMsg("Erreur réseau");
      setState("error");
      setTimeout(() => setState("idle"), 6000);
    }
  };

  if (variant === "editor") {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={post}
          disabled={state === "loading" || state === "success"}
          className={`px-4 py-2.5 text-[12px] font-bold tracking-widest uppercase transition-colors disabled:opacity-60 flex items-center gap-2 ${
            state === "success"
              ? "bg-[#1877F2] text-white"
              : state === "error"
              ? "bg-red-100 text-red-700 border border-red-300"
              : "bg-[#1877F2] text-white hover:bg-[#166FE5]"
          }`}
        >
          <FacebookIcon />
          {state === "loading"
            ? "Publication…"
            : state === "success"
            ? "✓ Publié !"
            : state === "error"
            ? "Erreur"
            : "Facebook"}
        </button>
        {state === "error" && errorMsg && (
          <p className="text-[10px] text-red-500 max-w-[200px] text-right">{errorMsg}</p>
        )}
      </div>
    );
  }

  // Variant list
  if (state === "success") {
    return (
      <span className="text-[11px] font-bold text-[#1877F2]">✓ Posté !</span>
    );
  }

  if (state === "error") {
    return (
      <span className="text-[10px] text-red-500" title={errorMsg}>
        Erreur FB
      </span>
    );
  }

  return (
    <button
      onClick={post}
      disabled={state === "loading"}
      title="Publier sur Facebook"
      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1877F2] text-white text-[11px] font-bold rounded hover:bg-[#166FE5] disabled:opacity-50 transition-colors"
    >
      <FacebookIcon size={12} />
      {state === "loading" ? "…" : "FB"}
    </button>
  );
}

function FacebookIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
