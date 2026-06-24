"use client";

import { useState } from "react";

interface Props {
  variant?: "footer" | "section";
}

export default function NewsletterForm({ variant = "footer" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("ok");
        setEmail("");
      } else {
        setStatus("error");
        setMsg(data.error || "Une erreur est survenue");
      }
    } catch {
      setStatus("error");
      setMsg("Une erreur est survenue");
    }
  };

  if (variant === "section") {
    return (
      <section className="bg-[#111111] py-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[11px] tracking-widest uppercase text-[#E53935] font-bold mb-3">
            Newsletter
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            L&apos;actu qui compte, chaque semaine.
          </h2>
          <p className="text-[15px] text-white/60 mb-8">
            Rejoins les lecteurs qui ne ratent rien. Résumé hebdomadaire, exclusifs, rien de plus.
          </p>

          {status === "ok" ? (
            <div className="bg-[#1a1a1a] border border-[#E53935]/30 rounded-2xl px-6 py-5 text-white">
              <p className="text-lg font-bold mb-1">Tu es inscrit(e) !</p>
              <p className="text-white/60 text-[13px]">Bienvenue dans la communauté Réalitte.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.com"
                required
                className="flex-1 px-4 py-3.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E53935] text-[14px] transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3.5 bg-[#E53935] text-white font-bold rounded-xl hover:bg-[#c62828] transition-colors disabled:opacity-50 text-[14px] whitespace-nowrap"
              >
                {status === "loading" ? "..." : "S'abonner"}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="mt-3 text-[12px] text-red-400">{msg}</p>
          )}
          <p className="mt-4 text-[11px] text-white/30">
            Pas de spam. Désinscription en 1 clic.
          </p>
        </div>
      </section>
    );
  }

  // variant footer
  return (
    <div>
      <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#E53935] mb-4">
        Newsletter
      </h3>
      {status === "ok" ? (
        <p className="text-[13px] text-white/70">Merci, tu es inscrit(e) !</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ton@email.com"
            required
            className="px-3 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#E53935] text-[13px] transition-colors"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-4 py-2.5 bg-[#E53935] text-white text-[12px] font-bold rounded-lg hover:bg-[#c62828] transition-colors disabled:opacity-50"
          >
            {status === "loading" ? "..." : "S'abonner"}
          </button>
          {status === "error" && (
            <p className="text-[11px] text-red-400">{msg}</p>
          )}
          <p className="text-[10px] text-white/30">Pas de spam. Désinscription en 1 clic.</p>
        </form>
      )}
    </div>
  );
}
