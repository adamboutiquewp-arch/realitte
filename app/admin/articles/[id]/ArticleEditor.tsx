"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
            <p className="text-[#006621] text-[13px]">realitte.fr › …</p>
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
