"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FacebookPostButton from "@/components/admin/FacebookPostButton";

interface Categorie {
  id: string;
  nom: string;
  slug: string;
  couleur: string;
}

interface Article {
  id: string;
  titre: string;
  slug: string;
  chapo: string;
  contenu: string;
  imageUrl: string | null;
  imageAlt: string | null;
  categorieId: string;
  sousCategorie: string | null;
  tags: string[];
  sourceUrl: string;
  sourceNom: string;
  statut: string;
  auteur: string;
  metaTitle: string | null;
  metaDescription: string | null;
  featured: boolean;
  dateCreation: string;
  datePublication: string | null;
  categorie: Categorie;
}

interface Props {
  article: Article;
  categories: Categorie[];
}

export default function ArticleEditor({ article, categories }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    titre: article.titre,
    chapo: article.chapo,
    contenu: article.contenu,
    imageUrl: article.imageUrl || "",
    imageAlt: article.imageAlt || "",
    categorieId: article.categorieId,
    sousCategorie: article.sousCategorie || "",
    tags: article.tags.join(", "),
    sourceUrl: article.sourceUrl,
    sourceNom: article.sourceNom,
    metaTitle: article.metaTitle || "",
    metaDescription: article.metaDescription || "",
    featured: article.featured,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"contenu" | "seo" | "apercu">("contenu");
  const [wikiSearch, setWikiSearch] = useState(article.titre);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiMsg, setWikiMsg] = useState("");

  const [ovSearch, setOvSearch] = useState(article.titre);
  const [ovLoading, setOvLoading] = useState(false);
  const [ovResults, setOvResults] = useState<{ url: string; thumbnail: string; title: string; creator: string }[]>([]);
  const [ovMsg, setOvMsg] = useState("");

  const searchWikipedia = async () => {
    if (!wikiSearch.trim()) return;
    setWikiLoading(true);
    setWikiMsg("");
    try {
      const tryLang = async (lang: string) => {
        const res = await fetch(
          `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiSearch.trim())}`
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data.originalimage?.source || data.thumbnail?.source || null;
      };
      const url = (await tryLang("fr")) ?? (await tryLang("en"));
      if (url) {
        setForm((f) => ({ ...f, imageUrl: url, imageAlt: wikiSearch.trim() }));
        setWikiMsg("✓ Photo trouvée !");
      } else {
        setWikiMsg("Aucune photo trouvée sur Wikipedia.");
      }
    } catch {
      setWikiMsg("Erreur de connexion.");
    } finally {
      setWikiLoading(false);
    }
  };

  const searchOpenverse = async () => {
    if (!ovSearch.trim()) return;
    setOvLoading(true);
    setOvMsg("");
    setOvResults([]);
    try {
      const res = await fetch(
        `https://api.openverse.org/v1/images/?q=${encodeURIComponent(ovSearch.trim())}&per_page=9&license_type=commercial,modification`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data.results?.length) { setOvMsg("Aucun résultat."); return; }
      setOvResults(data.results.map((r: { url: string; thumbnail: string; title: string; creator: string }) => ({
        url: r.url, thumbnail: r.thumbnail, title: r.title, creator: r.creator,
      })));
    } catch {
      setOvMsg("Erreur de connexion à Openverse.");
    } finally {
      setOvLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));
  };

  const save = async (newStatut?: string) => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          statut: newStatut,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(newStatut ? `Article ${newStatut === "PUBLISHED" ? "publié" : newStatut === "REJECTED" ? "rejeté" : "sauvegardé"} !` : "Sauvegardé !");
        if (newStatut === "PUBLISHED" || newStatut === "REJECTED") {
          setTimeout(() => router.push("/admin/articles"), 1000);
        }
      } else {
        setMessage(data.error || "Erreur lors de la sauvegarde.");
      }
    } catch {
      setMessage("Erreur réseau.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/articles" className="text-[#9E9E9E] hover:text-black text-[13px]">
              ← Articles
            </Link>
          </div>
          <h1 className="text-xl font-black text-[#111111] line-clamp-1">{article.titre}</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => save()} disabled={saving}
            className="px-4 py-2.5 border border-[#E0E0E0] text-[12px] font-bold tracking-widest uppercase hover:border-black disabled:opacity-50 transition-colors">
            Sauvegarder
          </button>
          <button onClick={() => save("DRAFT")} disabled={saving}
            className="px-4 py-2.5 bg-[#E2E3E5] text-[#383D41] text-[12px] font-bold tracking-widest uppercase hover:bg-[#C8C9CA] disabled:opacity-50 transition-colors">
            Brouillon
          </button>
          <button onClick={() => save("REJECTED")} disabled={saving}
            className="px-4 py-2.5 bg-[#F8D7DA] text-[#721C24] text-[12px] font-bold tracking-widest uppercase hover:bg-[#F5C6CB] disabled:opacity-50 transition-colors">
            Rejeter
          </button>
          <button onClick={() => save("PUBLISHED")} disabled={saving}
            className="px-4 py-2.5 bg-black text-white text-[12px] font-bold tracking-widest uppercase hover:bg-[#E53935] disabled:opacity-50 transition-colors">
            {saving ? "…" : "Publier"}
          </button>
          {article.statut === "PUBLISHED" && (
            <FacebookPostButton articleId={article.id} variant="editor" />
          )}
        </div>
      </div>

      {message && (
        <div className="mb-4 px-4 py-3 bg-[#D4EDDA] text-[#155724] text-[13px] font-medium">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#E0E0E0] mb-6">
        {(["contenu", "seo", "apercu"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-[12px] font-bold tracking-widest uppercase border-b-2 transition-colors ${
              activeTab === tab ? "border-[#E53935] text-black" : "border-transparent text-[#9E9E9E] hover:text-black"
            }`}>
            {tab === "contenu" ? "Contenu" : tab === "seo" ? "SEO" : "Aperçu"}
          </button>
        ))}
      </div>

      {/* Tab Contenu */}
      {activeTab === "contenu" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-5">
            <Field label="Titre">
              <textarea value={form.titre} onChange={update("titre")} rows={2}
                className="w-full px-4 py-3 border border-[#E0E0E0] text-[14px] font-semibold outline-none focus:border-black resize-none" />
            </Field>
            <Field label="Chapô">
              <textarea value={form.chapo} onChange={update("chapo")} rows={3}
                className="w-full px-4 py-3 border border-[#E0E0E0] text-[14px] outline-none focus:border-black resize-none" />
            </Field>
            <Field label="Contenu (HTML)">
              <textarea value={form.contenu} onChange={update("contenu")} rows={20}
                className="w-full px-4 py-3 border border-[#E0E0E0] text-[13px] font-mono outline-none focus:border-black resize-y" />
            </Field>
          </div>

          <div className="space-y-5">
            <Field label="Catégorie">
              <select value={form.categorieId} onChange={update("categorieId")}
                className="w-full px-4 py-3 border border-[#E0E0E0] text-[13px] outline-none focus:border-black">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </Field>
            <Field label="Sous-catégorie">
              <input type="text" value={form.sousCategorie} onChange={update("sousCategorie")}
                className="w-full px-4 py-3 border border-[#E0E0E0] text-[13px] outline-none focus:border-black" />
            </Field>
            <Field label="Tags (virgule-séparés)">
              <input type="text" value={form.tags} onChange={update("tags")}
                placeholder="PSG, Football, Ligue des Champions"
                className="w-full px-4 py-3 border border-[#E0E0E0] text-[13px] outline-none focus:border-black" />
            </Field>
            {/* Recherche Wikipedia */}
            <div className="p-3 bg-[#F9F9F9] border border-[#E0E0E0]">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#999] mb-2">Chercher photo Wikipedia</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={wikiSearch}
                  onChange={(e) => setWikiSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchWikipedia()}
                  placeholder="Nom de la personnalité..."
                  className="flex-1 px-3 py-2 border border-[#E0E0E0] text-[12px] outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={searchWikipedia}
                  disabled={wikiLoading}
                  className="px-3 py-2 bg-[#111] text-white text-[11px] font-bold hover:bg-[#E53935] transition-colors disabled:opacity-50"
                >
                  {wikiLoading ? "…" : "Chercher"}
                </button>
              </div>
              {wikiMsg && (
                <p className={`text-[11px] mt-1.5 font-medium ${wikiMsg.startsWith("✓") ? "text-green-600" : "text-red-500"}`}>
                  {wikiMsg}
                </p>
              )}
            </div>
            {/* Recherche Openverse */}
            <div className="p-3 bg-[#F0F4FF] border border-[#C7D7FF]">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#6B7CDD] mb-2">Chercher photo Openverse (libre de droits)</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ovSearch}
                  onChange={(e) => setOvSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchOpenverse()}
                  placeholder="Mot-clé ou nom..."
                  className="flex-1 px-3 py-2 border border-[#C7D7FF] text-[12px] outline-none focus:border-[#6B7CDD] bg-white"
                />
                <button
                  type="button"
                  onClick={searchOpenverse}
                  disabled={ovLoading}
                  className="px-3 py-2 bg-[#6B7CDD] text-white text-[11px] font-bold hover:bg-[#E53935] transition-colors disabled:opacity-50"
                >
                  {ovLoading ? "…" : "Chercher"}
                </button>
              </div>
              {ovMsg && <p className="text-[11px] text-red-500 mb-1">{ovMsg}</p>}
              {ovResults.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {ovResults.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      title={`${img.title} — ${img.creator}`}
                      onClick={() => {
                        setForm((f) => ({ ...f, imageUrl: img.url, imageAlt: img.title || ovSearch }));
                        setOvResults([]);
                        setOvMsg("✓ Photo sélectionnée !");
                      }}
                      className="relative aspect-square overflow-hidden border-2 border-transparent hover:border-[#E53935] transition-all"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.thumbnail} alt={img.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {ovMsg?.startsWith("✓") && <p className="text-[11px] text-green-600 mt-1 font-medium">{ovMsg}</p>}
            </div>

            <Field label="URL image">
              <input type="url" value={form.imageUrl} onChange={update("imageUrl")}
                className="w-full px-4 py-3 border border-[#E0E0E0] text-[13px] outline-none focus:border-black" />
            </Field>
            <Field label="Alt image">
              <input type="text" value={form.imageAlt} onChange={update("imageAlt")}
                className="w-full px-4 py-3 border border-[#E0E0E0] text-[13px] outline-none focus:border-black" />
            </Field>
            <Field label="Source (nom)">
              <input type="text" value={form.sourceNom} onChange={update("sourceNom")}
                className="w-full px-4 py-3 border border-[#E0E0E0] text-[13px] outline-none focus:border-black" />
            </Field>
            <Field label="Source (URL)">
              <input type="url" value={form.sourceUrl} onChange={update("sourceUrl")}
                className="w-full px-4 py-3 border border-[#E0E0E0] text-[13px] outline-none focus:border-black" />
            </Field>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                className="w-4 h-4 accent-[#E53935]" />
              <span className="text-[13px] font-medium">Article hero (featured)</span>
            </label>
          </div>
        </div>
      )}

      {/* Tab SEO */}
      {activeTab === "seo" && (
        <div className="max-w-2xl space-y-5">
          <Field label="Meta titre (SEO)">
            <input type="text" value={form.metaTitle} onChange={update("metaTitle")}
              maxLength={60}
              placeholder={form.titre}
              className="w-full px-4 py-3 border border-[#E0E0E0] text-[13px] outline-none focus:border-black" />
            <p className="text-[11px] text-[#9E9E9E] mt-1">{form.metaTitle.length}/60 caractères</p>
          </Field>
          <Field label="Meta description (SEO)">
            <textarea value={form.metaDescription} onChange={update("metaDescription")}
              maxLength={160} rows={3}
              placeholder={form.chapo}
              className="w-full px-4 py-3 border border-[#E0E0E0] text-[13px] outline-none focus:border-black resize-none" />
            <p className="text-[11px] text-[#9E9E9E] mt-1">{form.metaDescription.length}/160 caractères</p>
          </Field>
          {/* Aperçu SERP */}
          <div className="p-4 bg-[#F5F5F5] border border-[#E0E0E0]">
            <p className="text-[11px] text-[#9E9E9E] mb-3 uppercase tracking-wider font-bold">Aperçu Google</p>
            <p className="text-[#1558D6] text-[16px] hover:underline cursor-pointer">
              {form.metaTitle || form.titre}
            </p>
            <p className="text-[#006621] text-[13px]">realitte.com › …</p>
            <p className="text-[#424242] text-[13px] mt-1 line-clamp-2">
              {form.metaDescription || form.chapo}
            </p>
          </div>
        </div>
      )}

      {/* Tab Aperçu */}
      {activeTab === "apercu" && (
        <div className="max-w-2xl">
          <h1 className="text-3xl font-black mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            {form.titre}
          </h1>
          <p className="text-[17px] italic text-[#424242] mb-6">{form.chapo}</p>
          <div
            className="prose-realitte"
            dangerouslySetInnerHTML={{ __html: form.contenu }}
          />
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold tracking-widest uppercase text-[#424242] mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
