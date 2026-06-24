"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Inscription réussie !");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Une erreur est survenue.");
      }
    } catch {
      setStatus("error");
      setMessage("Erreur réseau. Réessayez plus tard.");
    }
  };

  return (
    <div>
      <h2 className="text-[17px] font-black tracking-tight uppercase mb-1">
        Newsletter
      </h2>
      <div className="w-8 h-[3px] bg-[#E53935] mb-4" />
      <p className="text-[13px] text-[#424242] leading-relaxed mb-5">
        L&apos;actualité sans filtre, chaque matin dans votre boîte mail.
      </p>

      {status === "success" ? (
        <div className="bg-[#F5F5F5] px-4 py-3 text-[13px] font-medium text-[#111111]">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-0">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre e-mail"
            className="flex-1 px-4 py-3 text-[13px] border border-[#E0E0E0] outline-none focus:border-black placeholder:text-[#9E9E9E] min-w-0"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-5 py-3 bg-black text-white text-[12px] font-bold tracking-widest uppercase hover:bg-[#E53935] transition-colors duration-200 flex-shrink-0 disabled:opacity-50"
          >
            {status === "loading" ? "…" : "S'inscrire"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="mt-2 text-[12px] text-[#E53935]">{message}</p>
      )}
    </div>
  );
}
