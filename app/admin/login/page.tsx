"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      motDePasse,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Réalitte<span className="text-[#E53935]">.</span>
          </h1>
          <p className="text-[#9E9E9E] text-sm mt-1 tracking-widest uppercase">
            Back-office
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white p-8 space-y-5">
          <h2 className="text-lg font-bold text-[#111111] mb-6">
            Connexion administrateur
          </h2>

          <div>
            <label className="block text-[12px] font-bold tracking-wider uppercase text-[#424242] mb-2">
              Adresse e-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full px-4 py-3 border border-[#E0E0E0] text-[14px] outline-none focus:border-black transition-colors"
              placeholder="admin@realitte.fr"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold tracking-wider uppercase text-[#424242] mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-[#E0E0E0] text-[14px] outline-none focus:border-black transition-colors"
              placeholder="••••••••••"
            />
          </div>

          {error && (
            <p className="text-[#E53935] text-[13px] font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-black text-white text-[13px] font-bold tracking-widest uppercase hover:bg-[#E53935] transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-[11px] text-[#424242] mt-6">
          Accès réservé aux membres de l&apos;équipe Réalitte
        </p>
      </div>
    </div>
  );
}
