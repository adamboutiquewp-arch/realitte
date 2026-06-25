"use client";

import { useState } from "react";

const SITE_URL = "https://realitte.com";

interface Article {
  id: string;
  titre: string;
  chapo: string;
  slug: string;
  tags: string[];
  categorie: { slug: string };
}

interface Props {
  article: Article;
  variant?: "list" | "editor";
}

function buildText(article: Article) {
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
    `👉 ${url}`,
    hashtags ? `\n${hashtags}` : "",
  ].join("\n").trim();
}

export default function FacebookPostButton({ article, variant = "list" }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const openModal = () => {
    setText(buildText(article));
    setCopied(false);
    setOpen(true);
  };

  const publish = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // fallback si clipboard bloqué
    }
    window.open("https://business.facebook.com/latest/composer/", "_blank");
  };

  const copyOnly = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {}
  };

  return (
    <>
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
          title="Partager sur Facebook"
          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1877F2] text-white text-[11px] font-bold rounded hover:bg-[#166FE5] transition-colors"
        >
          <FacebookIcon size={12} />
          FB
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0E0E0]">
              <div className="flex items-center gap-2">
                <FacebookIcon size={18} color="#1877F2" />
                <h2 className="text-[15px] font-black text-[#111]">Post Facebook</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#999] hover:text-black text-[22px] leading-none">×</button>
            </div>

            <div className="p-5 space-y-4">
              {/* Texte éditable */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold tracking-widest uppercase text-[#424242]">
                    Texte du post
                  </p>
                  <button
                    onClick={copyOnly}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded transition-colors ${
                      copied
                        ? "bg-green-100 text-green-700"
                        : "bg-[#F0F0F0] text-[#555] hover:bg-[#E0E0E0]"
                    }`}
                  >
                    {copied ? "✓ Copié !" : "Copier"}
                  </button>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-3 border border-[#E0E0E0] text-[13px] outline-none focus:border-[#1877F2] resize-none"
                />
              </div>

              {/* Info */}
              <div className="px-3 py-2.5 bg-[#E7F3FF] border border-[#C3D9F5] text-[12px] text-[#1877F2]">
                Le texte sera copié automatiquement — colle-le avec <strong>Ctrl+V</strong> dans Meta Business Suite et choisis <strong>Facebook + Instagram</strong>
              </div>

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
                  className="px-6 py-2.5 bg-[#1877F2] text-white text-[12px] font-bold uppercase tracking-widest hover:bg-[#166FE5] transition-colors flex items-center gap-2"
                >
                  <FacebookIcon size={14} />
                  Copier &amp; Ouvrir Meta Business Suite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FacebookIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
