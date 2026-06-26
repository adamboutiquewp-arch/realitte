"use client";

import { useState } from "react";
import Image from "next/image";

interface Slot {
  id: string;
  titre: string;
  sousTitre: string | null;
  imageUrl: string | null;
  lien: string | null;
  ctaTexte: string;
  actif: boolean;
  ordre: number;
  clics: number;
  padding: number;
}

interface Props {
  slots: Slot[];
}

export default function PartenairesManager({ slots: initial }: Props) {
  const [slots, setSlots] = useState<Slot[]>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [form, setForm] = useState<Partial<Slot>>({});
  const [paddings, setPaddings] = useState<Record<string, number>>(
    Object.fromEntries(initial.map((s) => [s.id, s.padding ?? 4]))
  );
  const [savingPadding, setSavingPadding] = useState<string | null>(null);

  const TOTAL_SLOTS = 3;
  const occupied = slots.filter((s) => s.actif);
  const displaySlots: (Slot | null)[] = Array.from({ length: TOTAL_SLOTS }, (_, i) =>
    slots.find((s) => s.ordre === i) ?? null
  );

  const openEdit = (slot: Slot | null, index: number) => {
    if (slot) {
      setEditing(slot.id);
      setForm({ ...slot });
    } else {
      setEditing("new-" + index);
      setForm({ ordre: index, titre: "", lien: "", imageUrl: null, ctaTexte: "EN SAVOIR PLUS", sousTitre: "ESPACE PARTENAIRE", actif: true, padding: 4 });
    }
  };

  const uploadLogo = async (file: File) => {
    setUploadLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setForm((f) => ({ ...f, imageUrl: data.url }));
    } finally {
      setUploadLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing?.startsWith("new-")) {
        const res = await fetch("/api/admin/partenaires", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        setSlots((prev) => [...prev, data.slot]);
        setPaddings((p) => ({ ...p, [data.slot.id]: data.slot.padding ?? 4 }));
      } else {
        const res = await fetch(`/api/admin/partenaires/${editing}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        setSlots((prev) => prev.map((s) => (s.id === editing ? data.slot : s)));
      }
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce partenaire ?")) return;
    await fetch(`/api/admin/partenaires/${id}`, { method: "DELETE" });
    setSlots((prev) => prev.filter((s) => s.id !== id));
    setEditing(null);
  };

  const savePadding = async (id: string) => {
    setSavingPadding(id);
    try {
      await fetch(`/api/admin/partenaires/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ padding: paddings[id] }),
      });
      setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, padding: paddings[id] } : s)));
    } finally {
      setSavingPadding(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Résumé */}
      <div className="flex gap-4 text-[13px]">
        <span className="px-3 py-1 bg-green-100 text-green-700 font-bold">{occupied.length} occupé{occupied.length > 1 ? "s" : ""}</span>
        <span className="px-3 py-1 bg-gray-100 text-gray-500 font-bold">{TOTAL_SLOTS - occupied.length} disponible{TOTAL_SLOTS - occupied.length > 1 ? "s" : ""}</span>
      </div>

      {/* 3 slots */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {displaySlots.map((slot, i) => (
          <div key={i} className={`border-2 ${slot ? "border-[#C9A84C]" : "border-dashed border-[#DDD]"} p-4 flex flex-col gap-3`}>
            <div className="text-[10px] font-bold tracking-widest uppercase text-[#9E9E9E]">
              Slot {i + 1}
            </div>

            {slot ? (
              <>
                {/* Aperçu à taille réelle (même hauteur que sidebar site) */}
                {slot.imageUrl && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">Aperçu taille réelle</p>
                    <div className="relative h-28 w-full border border-[#E0E0E0] overflow-hidden bg-white">
                      <div className="absolute" style={{ inset: `${paddings[slot.id] ?? 4}px` }}>
                        <Image
                          src={slot.imageUrl}
                          alt={slot.titre}
                          fill
                          className="object-contain"
                          sizes="300px"
                        />
                      </div>
                    </div>
                    {/* Slider zoom */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#9E9E9E]">
                        <span>← Plus grand</span>
                        <span>Plus petit →</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={40}
                        step={2}
                        value={paddings[slot.id] ?? 4}
                        onChange={(e) => setPaddings((p) => ({ ...p, [slot.id]: Number(e.target.value) }))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                    <button
                      onClick={() => savePadding(slot.id)}
                      disabled={savingPadding === slot.id}
                      className="w-full py-2 bg-amber-500 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors disabled:opacity-50"
                    >
                      {savingPadding === slot.id ? "Sauvegarde…" : "Sauvegarder la taille"}
                    </button>
                  </div>
                )}

                {/* Infos */}
                <div className="border-t border-[#F0F0F0] pt-3">
                  <p className="text-[13px] font-bold text-[#111]">{slot.titre}</p>
                  {slot.lien && <p className="text-[11px] text-[#9E9E9E] truncate">{slot.lien}</p>}
                  <p className="text-[12px] font-bold text-[#E53935] mt-1">👆 {slot.clics} clic{slot.clics > 1 ? "s" : ""}</p>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button onClick={() => openEdit(slot, i)}
                    className="flex-1 py-2 bg-[#111] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#E53935] transition-colors">
                    Modifier
                  </button>
                  <button onClick={() => remove(slot.id)}
                    className="px-3 py-2 border border-red-200 text-red-500 text-[11px] font-bold hover:bg-red-50 transition-colors">
                    ✕
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-full h-28 bg-[#F9F9F9] flex items-center justify-center">
                  <span className="text-[11px] text-[#BDBDBD] font-medium">Disponible</span>
                </div>
                <button onClick={() => openEdit(null, i)}
                  className="w-full py-2 border border-dashed border-[#C9A84C] text-[#C9A84C] text-[11px] font-bold uppercase tracking-widest hover:bg-[#C9A84C]/10 transition-colors">
                  + Ajouter un partenaire
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Formulaire d'édition */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="bg-white w-full max-w-md p-6 space-y-4">
            <h2 className="text-[16px] font-black uppercase tracking-tight">
              {editing.startsWith("new") ? "Ajouter un partenaire" : "Modifier le partenaire"}
            </h2>

            {/* Upload logo */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#9E9E9E] block mb-2">Logo / Visuel</label>
              {form.imageUrl && (
                <div className="mb-2 h-20 bg-[#F5F5F5] flex items-center justify-center border border-[#E0E0E0]">
                  <Image src={form.imageUrl} alt="logo" width={160} height={60} className="object-contain max-h-16" />
                </div>
              )}
              <label className={`flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed cursor-pointer transition-colors ${uploadLoading ? "border-[#C9A84C] bg-amber-50" : "border-[#DDD] hover:border-[#C9A84C]"}`}>
                <input type="file" accept="image/*" className="hidden" disabled={uploadLoading}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); e.target.value = ""; }} />
                <span className="text-[12px] text-[#9E9E9E] font-medium">
                  {uploadLoading ? "Upload en cours…" : "📁 Choisir un logo depuis mon ordinateur"}
                </span>
              </label>
              {form.imageUrl && (
                <button onClick={() => setForm((f) => ({ ...f, imageUrl: null }))}
                  className="mt-1 text-[11px] text-red-500 hover:underline">Supprimer le logo</button>
              )}
            </div>

            {/* Nom */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#9E9E9E] block mb-1">Nom du partenaire</label>
              <input type="text" value={form.titre || ""} onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
                placeholder="Ex : Nike, Apple, BNP…"
                className="w-full px-3 py-2.5 border border-[#E0E0E0] text-[13px] outline-none focus:border-black" />
            </div>

            {/* Lien */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#9E9E9E] block mb-1">Lien cliquable (URL)</label>
              <input type="url" value={form.lien || ""} onChange={(e) => setForm((f) => ({ ...f, lien: e.target.value }))}
                placeholder="https://www.example.com"
                className="w-full px-3 py-2.5 border border-[#E0E0E0] text-[13px] outline-none focus:border-black" />
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-2">
              <button onClick={save} disabled={saving}
                className="flex-1 py-3 bg-[#111] text-white text-[12px] font-bold uppercase tracking-widest hover:bg-[#E53935] transition-colors disabled:opacity-50">
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button onClick={() => setEditing(null)}
                className="px-4 py-3 border border-[#E0E0E0] text-[12px] font-bold uppercase tracking-widest hover:bg-[#F5F5F5] transition-colors">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
