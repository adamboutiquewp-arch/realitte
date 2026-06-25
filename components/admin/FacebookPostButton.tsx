"use client";

import { useState, useRef } from "react";

interface Article {
  id: string;
  titre: string;
  chapo: string;
  imageUrl: string | null;
  slug: string;
  tags: string[];
  categorie: { slug: string };
}

interface Props {
  article: Article;
  variant?: "list" | "editor";
}

const SITE_URL = "https://realitte.com";

function buildDefaultText(article: Article) {
  const hashtags = article.tags
    .slice(0, 5)
    .map((t) => `#${t.replace(/\s+/g, "")}`)
    .join(" ");
  const url = `${SITE_URL}/${article.categorie.slug}/${article.slug}`;
  return [
    article.titre,
    "",
    article.chapo,
    "",
    `Lire la suite 👉 ${url}`,
    hashtags ? `\n${hashtags}` : "",
  ]
    .join("\n")
    .trim();
}

export default function FacebookPostButton({ article, variant = "list" }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState(article.imageUrl || "");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [posting, setPosting] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const openModal = () => {
    setText(buildDefaultText(article));
    setImageUrl(article.imageUrl || "");
    setUploadMsg("");
    setResult(null);
    setErrorMsg("");
    setOpen(true);
  };

  const uploadImage = async (file: File) => {
    setUploadLoading(true);
    setUploadMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setImageUrl(data.url);
        setUploadMsg("✓ Image changée !");
      } else {
        setUploadMsg(data.error || "Erreur upload");
      }
    } catch {
      setUploadMsg("Erreur réseau");
    } finally {
      setUploadLoading(false);
    }
  };

  const publish = async () => {
    setPosting(true);
    setResult(null);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/facebook/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: article.id, message: text, imageUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult("success");
      } else {
        setErrorMsg(data.error || "Erreur inconnue");
        setResult("error");
      }
    } catch {
      setErrorMsg("Erreur réseau");
      setResult("error");
    } finally {
      setPosting(false);
    }
  };

  const charCount = text.length;

  return (
    <>
      {/* Bouton déclencheur */}
      {variant === "editor" ? (
        <button
          onClick={openModal}
          className="px-4 py-2.5 bg-[#1877F2] text-white text-[12px] font-bold tracking-widest uppercase hover:bg-[#166FE5] transition-colors flex items-center gap-2"
        >
          <FacebookIcon size={14} />
          Facebook
        </button>
      ) : (
        <button
          onClick={openModal}
          title="Publier sur Facebook"
          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1877F2] text-white text-[11px] font-bold rounded hover:bg-[#166FE5] transition-colors"
        >
          <FacebookIcon size={12} />
          FB
        </button>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => !posting && setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0E0E0]">
              <div className="flex items-center gap-2">
                <FacebookIcon size={18} className="text-[#1877F2]" />
                <h2 className="text-[15px] font-black text-[#111]">Publier sur Facebook</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#999] hover:text-black text-[20px] leading-none">×</button>
            </div>

            <div className="p-5 space-y-4">
              {/* Image */}
              <div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-[#424242] mb-2">Image du post</p>
                {imageUrl ? (
                  <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Aperçu"
                      className="w-full h-48 object-cover border border-[#E0E0E0]"
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute inset-0 bg-black/40 text-white text-[13px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                    >
                      📁 Changer l&apos;image
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-[#E0E0E0] hover:border-[#1877F2] flex items-center justify-center text-[13px] text-[#999] hover:text-[#1877F2] transition-colors"
                  >
                    📁 Ajouter une image
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file);
                    e.target.value = "";
                  }}
                />
                {uploadLoading && <p className="text-[11px] text-[#1877F2] mt-1">Upload en cours…</p>}
                {uploadMsg && (
                  <p className={`text-[11px] mt-1 font-medium ${uploadMsg.startsWith("✓") ? "text-green-600" : "text-red-500"}`}>
                    {uploadMsg}
                  </p>
                )}
                {imageUrl && !uploadLoading && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="mt-1.5 text-[11px] text-[#1877F2] hover:underline"
                  >
                    Changer l&apos;image
                  </button>
                )}
              </div>

              {/* Texte */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold tracking-widest uppercase text-[#424242]">Texte du post</p>
                  <span className={`text-[11px] ${charCount > 2000 ? "text-red-500" : "text-[#999]"}`}>
                    {charCount} / 2000
                  </span>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-3 border border-[#E0E0E0] text-[13px] outline-none focus:border-[#1877F2] resize-none font-sans"
                />
              </div>

              {/* Résultat */}
              {result === "success" && (
                <div className="px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-[13px] font-medium">
                  ✓ Article publié sur Facebook avec succès !
                </div>
              )}
              {result === "error" && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-[13px]">
                  ✗ {errorMsg}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2.5 border border-[#E0E0E0] text-[12px] font-bold uppercase tracking-widest hover:border-black transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={publish}
                  disabled={posting || !text.trim() || result === "success"}
                  className="px-6 py-2.5 bg-[#1877F2] text-white text-[12px] font-bold uppercase tracking-widest hover:bg-[#166FE5] disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <FacebookIcon size={14} />
                  {posting ? "Publication…" : result === "success" ? "Publié !" : "Publier"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FacebookIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
