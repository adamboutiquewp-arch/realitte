"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface Categorie {
  id: string;
  nom: string;
  slug: string;
  couleur: string;
}

const EXEMPLES = [
  "Les meilleurs buteurs de Ligue 1 cette saison",
  "Macron annonce une réforme fiscale",
  "La startup française qui révolutionne l'IA",
  "Mbappé et le Real Madrid : bilan de la première année",
  "Réchauffement climatique : les chiffres alarmants de 2025",
  "Les 10 entrepreneurs français qui font bouger les lignes",
];

type Mode = "sujet" | "photo";

export default function GenerateurCustom({ categories }: { categories: Categorie[] }) {
  const [mode, setMode] = useState<Mode>("sujet");
  const [sujet, setSujet] = useState("");
  const [categorieSlug, setCategorieSlug] = useState("");
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [imageClean, setImageClean] = useState(false);
  const [state, setState] = useState<"idle" | "uploading" | "loading" | "ok" | "error">("idle");
  const [result, setResult] = useState<{ articleId: string; titre: string; slug: string; webSearchUsed?: boolean } | null>(null);
  const [error, setError] = useState("");

  // Photo mode
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (file: File) => {
    setState("uploading");
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Erreur upload");
      setUploadedImageUrl(data.url);
      setState("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur upload");
      setState("error");
    }
  };

  const onFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setUploadedImageUrl(null);
    await handlePhotoUpload(file);
  };

  const generate = async () => {
    if (state === "loading" || state === "uploading") return;
    if (mode === "sujet" && !sujet.trim()) return;
    if (mode === "photo" && !uploadedImageUrl) return;

    setState("loading");
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/admin/generate-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sujet: sujet.trim() || undefined,
          categorieSlugHint: categorieSlug || undefined,
          useWebSearch: mode === "sujet" ? useWebSearch : false,
          imageUrl: mode === "photo" ? uploadedImageUrl : undefined,
          imageClean,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setResult(data);
      setState("ok");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setResult(null);
    setError("");
    setSujet("");
    setCategorieSlug("");
    setUploadedImageUrl(null);
    setPhotoPreview(null);
  };

  const canGenerate =
    (mode === "sujet" && sujet.trim().length > 0) ||
    (mode === "photo" && uploadedImageUrl !== null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F0F0F0] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E53935]/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#E53935]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-[14px] font-bold text-[#111]">Générer un article</h2>
            <p className="text-[11px] text-[#bbb]">Claude rédige un article de 400-600 mots</p>
          </div>

          {/* Toggle mode */}
          <div className="ml-auto flex bg-[#F5F5F5] rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => { setMode("sujet"); setError(""); }}
              className={`px-3 py-1.5 rounded-md text-[12px] font-bold transition-all ${mode === "sujet" ? "bg-white text-[#111] shadow-sm" : "text-[#999]"}`}
            >
              ✍️ Sujet
            </button>
            <button
              onClick={() => { setMode("photo"); setError(""); }}
              className={`px-3 py-1.5 rounded-md text-[12px] font-bold transition-all ${mode === "photo" ? "bg-white text-[#111] shadow-sm" : "text-[#999]"}`}
            >
              📷 Photo
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Mode SUJET */}
          {mode === "sujet" && (
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-[#999] mb-2">
                Sujet de l&apos;article *
              </label>
              <textarea
                value={sujet}
                onChange={(e) => setSujet(e.target.value)}
                placeholder="Ex: Mbappé signe au Real Madrid, les conséquences pour la Ligue 1..."
                rows={3}
                disabled={state === "loading"}
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] transition-colors resize-none disabled:opacity-50 disabled:bg-[#F9F9F9]"
              />
              <p className="text-[11px] text-[#bbb] mt-1">
                Plus tu es précis, meilleur sera l&apos;article.
              </p>
            </div>
          )}

          {/* Mode PHOTO */}
          {mode === "photo" && (
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-[#999] mb-2">
                Ta photo *
              </label>

              {photoPreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="" className="w-full h-48 object-cover rounded-lg border border-[#E8E8E8]" />
                  {state === "uploading" && (
                    <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center gap-2 text-[13px] font-bold text-[#111]">
                      <Spinner /> Upload en cours…
                    </div>
                  )}
                  {uploadedImageUrl && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-[11px] font-bold px-2 py-1 rounded">
                      ✓ Photo prête
                    </div>
                  )}
                  <button
                    onClick={() => { setPhotoPreview(null); setUploadedImageUrl(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="mt-2 text-[11px] text-[#999] hover:text-[#E53935] transition-colors"
                  >
                    Changer la photo
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-[#E8E8E8] rounded-lg p-10 text-center cursor-pointer hover:border-[#E53935] hover:bg-[#FFF5F5] transition-all"
                >
                  <svg className="w-8 h-8 text-[#bbb] mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p className="text-[13px] font-bold text-[#666]">Clique pour choisir une photo</p>
                  <p className="text-[11px] text-[#bbb] mt-1">JPG, PNG, WebP — max 10 Mo</p>
                </div>
              )}

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFilePick} />

              {/* Sujet optionnel en mode photo */}
              <div className="mt-4">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#999] mb-2">
                  Précision optionnelle (Claude analyse la photo automatiquement)
                </label>
                <input
                  type="text"
                  value={sujet}
                  onChange={(e) => setSujet(e.target.value)}
                  placeholder="Ex: portrait de Karim Benzema, match PSG-OM..."
                  disabled={state === "loading"}
                  className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] transition-colors disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Catégorie */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-[#999] mb-2">
              Catégorie (optionnel)
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategorieSlug("")}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                  !categorieSlug ? "bg-[#111] text-white border-[#111]" : "bg-[#F5F5F5] text-[#999] border-[#E8E8E8] hover:border-[#bbb]"
                }`}
              >
                Auto
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategorieSlug(cat.slug)}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all"
                  style={
                    categorieSlug === cat.slug
                      ? { backgroundColor: cat.couleur, color: "#fff", borderColor: cat.couleur }
                      : { backgroundColor: "#F5F5F5", color: "#999", borderColor: "#E8E8E8" }
                  }
                >
                  {cat.nom}
                </button>
              ))}
            </div>
          </div>

          {/* Recherche web (mode sujet seulement) */}
          {mode === "sujet" && (
            <div className="flex items-center justify-between p-3 bg-[#F0F7FF] border border-[#C3D9F5] rounded-lg">
              <div>
                <p className="text-[12px] font-bold text-[#1877F2]">🔍 Recherche web en temps réel</p>
                <p className="text-[11px] text-[#6B9FD4] mt-0.5">Claude cherche sur internet avant d&apos;écrire</p>
              </div>
              <button
                onClick={() => setUseWebSearch((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${useWebSearch ? "bg-[#1877F2]" : "bg-[#DDD]"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${useWebSearch ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          )}

          {mode === "photo" && uploadedImageUrl && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-[12px] font-bold text-purple-700">📷 Claude va analyser ta photo</p>
              <p className="text-[11px] text-purple-500 mt-0.5">Il va reconnaître le contenu, les personnes, le contexte — et écrire un article qui correspond exactement à la photo</p>
            </div>
          )}

          {/* Image propre */}
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <input type="checkbox" checked={imageClean} onChange={(e) => setImageClean(e.target.checked)}
              className="w-4 h-4 accent-amber-500 flex-shrink-0" />
            <div>
              <p className="text-[12px] font-bold text-amber-800">Image propre — sans texte dessus</p>
              <p className="text-[11px] text-amber-600 mt-0.5">L&apos;image s&apos;affichera sans titre ni texte en accueil</p>
            </div>
          </label>

          {/* Bouton */}
          <div className="pt-1">
            <button
              onClick={generate}
              disabled={!canGenerate || state === "loading" || state === "uploading"}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-lg text-[13px] font-bold transition-all ${
                state === "loading"
                  ? "bg-[#F5F5F5] text-[#999] cursor-wait"
                  : !canGenerate || state === "uploading"
                  ? "bg-[#F5F5F5] text-[#bbb] cursor-not-allowed"
                  : "bg-[#E53935] text-white hover:bg-[#c62828]"
              }`}
            >
              {state === "loading" ? (
                <><Spinner /> Claude rédige… (10-30 secondes)</>
              ) : state === "uploading" ? (
                <><Spinner /> Upload en cours…</>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  {mode === "photo" ? "Générer à partir de la photo" : "Générer l'article"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Résultat */}
      {state === "ok" && result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-green-800">Article généré avec succès !</p>
              <p className="text-[12px] text-green-700 mt-0.5 line-clamp-2">{result.titre}</p>
              {result.webSearchUsed && (
                <p className="text-[11px] text-blue-600 mt-1 font-medium">🔍 Basé sur des infos récentes trouvées sur internet</p>
              )}
              <p className="text-[11px] text-green-600 mt-2">
                L&apos;article est en attente de validation — révise-le et publie-le dans l&apos;éditeur.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <Link
                  href={`/admin/articles/${result.articleId}`}
                  className="px-4 py-2 bg-green-700 text-white text-[12px] font-bold rounded hover:bg-green-800 transition-colors"
                >
                  Éditer et publier →
                </Link>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-white text-green-700 border border-green-200 text-[12px] font-bold rounded hover:bg-green-50 transition-colors"
                >
                  Générer un autre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Erreur */}
      {state === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-[#E53935] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-[13px] text-[#c62828] font-medium">{error}</p>
          <button onClick={() => setState("idle")} className="ml-auto text-[11px] text-[#E53935] font-bold hover:underline">
            Réessayer
          </button>
        </div>
      )}

      {/* Exemples (mode sujet seulement) */}
      {state === "idle" && mode === "sujet" && (
        <div className="bg-white rounded-xl border border-[#EBEBEB] p-5">
          <p className="text-[11px] font-bold tracking-wider uppercase text-[#bbb] mb-3">Exemples de sujets</p>
          <div className="flex flex-wrap gap-2">
            {EXEMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setSujet(ex)}
                className="px-3 py-1.5 bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#666] text-[12px] rounded-lg transition-colors text-left"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  );
}
