"use client";

import { useState } from "react";

const SITE_URL = "https://realitte.com";

interface Article {
  id: string;
  titre: string;
  chapo: string;
  slug: string;
  tags: string[];
  imageUrl?: string | null;
  categorie: { slug: string };
}

interface Props {
  article: Article;
  variant?: "list" | "editor";
}

type Network = "facebook" | "instagram" | "tiktok" | "x";

const NETWORKS: { id: Network; label: string; color: string; icon: React.ReactNode }[] = [
  {
    id: "facebook", label: "Facebook", color: "#1877F2",
    icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  },
  {
    id: "instagram", label: "Instagram", color: "#E1306C",
    icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  },
  {
    id: "tiktok", label: "TikTok", color: "#010101",
    icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
  },
  {
    id: "x", label: "X", color: "#000000",
    icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
];

function buildText(article: Article, network: Network): string {
  const url = `${SITE_URL}/${article.categorie.slug}/${article.slug}`;
  const hashtags5 = article.tags.slice(0, 5).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ");
  const hashtags15 = article.tags.slice(0, 15).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ");

  switch (network) {
    case "facebook":
      return [article.titre, "", article.chapo, "", `👉 ${url}`, hashtags5 ? `\n${hashtags5}` : ""].join("\n").trim();
    case "instagram":
      return [article.titre, "", article.chapo, "", "🔗 Lien en bio", hashtags15 ? `\n.\n.\n.\n${hashtags15}` : ""].join("\n").trim();
    case "tiktok":
      return [`${article.titre} 🔥`, "", article.chapo.slice(0, 150) + (article.chapo.length > 150 ? "..." : ""), "", hashtags5].join("\n").trim();
    case "x": {
      // Twitter compte l'URL comme 23 chars + 1 espace = 24 réservés
      // On cible 256 chars max pour le texte (256 + 24 = 280)
      const tags = article.tags.slice(0, 2).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ");
      const suffix = tags ? `\n\n${tags}` : "";
      const prefix = `${article.titre}\n\n`;
      const available = Math.max(0, 256 - prefix.length - suffix.length);
      const chapo = article.chapo.length > available
        ? article.chapo.slice(0, available - 1) + "…"
        : article.chapo;
      return (prefix + chapo + suffix).trim();
    }
  }
}

type PostState = "idle" | "loading" | "success" | "error";

export default function SocialShareModal({ article, variant = "list" }: Props) {
  const [open, setOpen] = useState(false);
  const [network, setNetwork] = useState<Network>("facebook");
  const [texts, setTexts] = useState<Record<Network, string>>({ facebook: "", instagram: "", tiktok: "", x: "" });
  const [copied, setCopied] = useState(false);
  const [postState, setPostState] = useState<PostState>("idle");
  const [postError, setPostError] = useState("");

  const openModal = () => {
    setTexts({
      facebook: buildText(article, "facebook"),
      instagram: buildText(article, "instagram"),
      tiktok: buildText(article, "tiktok"),
      x: buildText(article, "x"),
    });
    setNetwork("facebook");
    setCopied(false);
    setPostState("idle");
    setPostError("");
    setOpen(true);
  };

  const currentText = texts[network];
  const activeNet = NETWORKS.find((n) => n.id === network)!;

  const copyOnly = async () => {
    try { await navigator.clipboard.writeText(currentText); setCopied(true); setTimeout(() => setCopied(false), 3000); } catch {}
  };

  const publishDirect = async () => {
    setPostState("loading");
    setPostError("");
    try {
      const res = await fetch("/api/admin/facebook/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article.id,
          message: currentText,
          imageUrl: article.imageUrl || null,
          network,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setPostError(data.error || "Erreur inconnue");
        setPostState("error");
      } else {
        setPostState("success");
      }
    } catch {
      setPostError("Erreur réseau");
      setPostState("error");
    }
  };

  return (
    <>
      {variant === "editor" ? (
        <button onClick={openModal} className="px-4 py-2.5 bg-[#111] text-white text-[12px] font-bold tracking-widest uppercase hover:bg-[#E53935] transition-colors flex items-center gap-2">
          <ShareIcon />
          Réseaux sociaux
        </button>
      ) : (
        <button onClick={openModal} title="Partager sur les réseaux" className="flex items-center gap-1 px-2.5 py-1.5 bg-[#111] text-white text-[11px] font-bold rounded hover:bg-[#E53935] transition-colors">
          <ShareIcon size={11} />
          Share
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0E0E0]">
              <h2 className="text-[15px] font-black text-[#111]">Publier sur les réseaux</h2>
              <button onClick={() => setOpen(false)} className="text-[#999] hover:text-black text-[22px] leading-none">×</button>
            </div>

            {/* Onglets */}
            <div className="flex border-b border-[#E0E0E0]">
              {NETWORKS.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { setNetwork(n.id); setCopied(false); setPostState("idle"); setPostError(""); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-bold transition-colors border-b-2 ${
                    network === n.id ? "border-current" : "border-transparent text-[#999] hover:text-[#555]"
                  }`}
                  style={network === n.id ? { color: n.color, borderColor: n.color } : {}}
                >
                  <span style={{ color: network === n.id ? n.color : "#999" }}>{n.icon}</span>
                  {n.label}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">
              {/* Photo */}
              {article.imageUrl && (
                <div className="flex items-center gap-3 p-3 bg-[#F9F9F9] border border-[#E0E0E0]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={article.imageUrl} alt="" className="w-16 h-16 object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#999] mb-1">Photo de l&apos;article</p>
                    <a
                      href={`/api/admin/download-image?url=${encodeURIComponent(article.imageUrl)}`}
                      download="realitte-photo.jpg"
                      className="text-[12px] font-bold text-[#111] hover:text-[#E53935] transition-colors"
                    >
                      ⬇ Télécharger la photo
                    </a>
                  </div>
                </div>
              )}

              {/* Texte */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold tracking-widest uppercase text-[#424242]">
                    Texte adapté pour {activeNet.label}
                  </p>
                  <button
                    onClick={copyOnly}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded transition-colors ${copied ? "bg-green-100 text-green-700" : "bg-[#F0F0F0] text-[#555] hover:bg-[#E0E0E0]"}`}
                  >
                    {copied ? "✓ Copié !" : "Copier"}
                  </button>
                </div>
                <textarea
                  value={currentText}
                  onChange={(e) => setTexts((t) => ({ ...t, [network]: e.target.value }))}
                  rows={9}
                  className="w-full px-3 py-3 border border-[#E0E0E0] text-[13px] outline-none resize-none"
                />
                {network === "x" && (
                  <p className={`text-[11px] mt-1 ${currentText.length + 24 > 280 ? "text-red-500 font-bold" : "text-[#999]"}`}>
                    {currentText.length + 24} / 280 caractères (URL incluse)
                  </p>
                )}
              </div>

              {/* Erreur API */}
              {postState === "error" && (
                <div className="px-3 py-2.5 bg-red-50 border border-red-200 text-[12px] text-red-600 font-medium">
                  ✗ {postError}
                </div>
              )}

              {/* Succès */}
              {postState === "success" && (
                <div className="px-3 py-2.5 bg-green-50 border border-green-200 text-[12px] text-green-700 font-bold">
                  ✓ Publié sur {activeNet.label} avec succès !
                </div>
              )}

              {/* Boutons action */}
              {network === "facebook" && (
                <button
                  onClick={() => { copyOnly(); window.open("https://business.facebook.com/latest/composer/", "_blank"); }}
                  className="w-full py-3 text-white text-[13px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: activeNet.color }}
                >
                  {activeNet.icon}
                  Copier &amp; Ouvrir Meta Business Suite
                </button>
              )}
              {network === "instagram" && (
                <button
                  onClick={() => { copyOnly(); window.open("https://business.facebook.com/latest/composer/", "_blank"); }}
                  className="w-full py-3 text-white text-[13px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: activeNet.color }}
                >
                  {activeNet.icon}
                  Copier &amp; Ouvrir Meta Business Suite
                </button>
              )}
              {network === "tiktok" && (
                <button
                  onClick={() => { copyOnly(); window.open("https://www.tiktok.com/upload", "_blank"); }}
                  className="w-full py-3 text-white text-[13px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: activeNet.color }}
                >
                  {activeNet.icon}
                  Copier &amp; Ouvrir TikTok
                </button>
              )}
              {network === "x" && (
                <button
                  onClick={() => {
                    const url = `${SITE_URL}/${article.categorie.slug}/${article.slug}`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(currentText)}&url=${encodeURIComponent(url)}`, "_blank", "width=600,height=400");
                  }}
                  className="w-full py-3 text-white text-[13px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: activeNet.color }}
                >
                  {activeNet.icon}
                  Publier sur X
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ShareIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}
