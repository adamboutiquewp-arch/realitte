import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Publicité" };
export const dynamic = "force-dynamic";

async function toggleActif(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const actif = formData.get("actif") === "true";
  await prisma.espacePartenaire.update({ where: { id }, data: { actif: !actif } });
  revalidatePath("/admin/pub");
  redirect("/admin/pub");
}

async function updatePartenaire(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const titre = (formData.get("titre") as string)?.trim();
  const sousTitre = (formData.get("sousTitre") as string)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const lien = (formData.get("lien") as string)?.trim() || null;
  const ctaTexte = (formData.get("ctaTexte") as string)?.trim() || "EN SAVOIR PLUS";

  if (!titre) return;

  await prisma.espacePartenaire.update({
    where: { id },
    data: { titre, sousTitre, imageUrl, lien, ctaTexte },
  });

  revalidatePath("/admin/pub");
  redirect("/admin/pub");
}

async function createPartenaire(formData: FormData) {
  "use server";
  const titre = (formData.get("titre") as string)?.trim();
  const sousTitre = (formData.get("sousTitre") as string)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const lien = (formData.get("lien") as string)?.trim() || null;
  const ctaTexte = (formData.get("ctaTexte") as string)?.trim() || "EN SAVOIR PLUS";
  const position = (formData.get("position") as string) || "home";

  if (!titre) return;

  await prisma.espacePartenaire.create({
    data: { titre, sousTitre, imageUrl, lien, ctaTexte, position, actif: true },
  });

  revalidatePath("/admin/pub");
  redirect("/admin/pub");
}

export default async function AdminPubPage() {
  const partenaires = await prisma.espacePartenaire.findMany({
    orderBy: { position: "asc" },
  });

  return (
    <div className="max-w-[900px]">
      <div className="mb-8">
        <h1 className="text-[22px] font-black text-[#111]">Publicité</h1>
        <p className="text-[13px] text-[#999] mt-0.5">Gestion des espaces partenaires</p>
      </div>

      {/* Liste des partenaires */}
      <div className="space-y-4 mb-8">
        {partenaires.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#EBEBEB] py-12 text-center">
            <p className="text-[14px] text-[#bbb]">Aucun espace partenaire. Créez-en un ci-dessous.</p>
          </div>
        ) : (
          partenaires.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-xl border overflow-hidden ${
                p.actif ? "border-[#EBEBEB]" : "border-[#F0F0F0] opacity-60"
              }`}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F5F5]">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${p.actif ? "bg-green-500" : "bg-[#ccc]"}`}
                  />
                  <span className="font-semibold text-[#111]">{p.titre}</span>
                  <span className="text-[11px] text-[#bbb] font-mono bg-[#F5F5F5] px-2 py-0.5 rounded">
                    {p.position}
                  </span>
                </div>
                <form action={toggleActif}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="actif" value={String(p.actif)} />
                  <button
                    type="submit"
                    className={`px-3 py-1.5 text-[11px] font-bold rounded transition-all ${
                      p.actif
                        ? "bg-[#F5F5F5] text-[#666] hover:bg-red-50 hover:text-red-600"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {p.actif ? "Désactiver" : "Activer"}
                  </button>
                </form>
              </div>

              <form action={updatePartenaire} className="px-6 py-5">
                <input type="hidden" name="id" value={p.id} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider uppercase text-[#bbb] mb-1.5">Titre</label>
                    <input
                      type="text"
                      name="titre"
                      defaultValue={p.titre}
                      required
                      className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider uppercase text-[#bbb] mb-1.5">Sous-titre</label>
                    <input
                      type="text"
                      name="sousTitre"
                      defaultValue={p.sousTitre || ""}
                      className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider uppercase text-[#bbb] mb-1.5">URL image</label>
                    <input
                      type="url"
                      name="imageUrl"
                      defaultValue={p.imageUrl || ""}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider uppercase text-[#bbb] mb-1.5">Lien de destination</label>
                    <input
                      type="url"
                      name="lien"
                      defaultValue={p.lien || ""}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider uppercase text-[#bbb] mb-1.5">Texte bouton CTA</label>
                    <input
                      type="text"
                      name="ctaTexte"
                      defaultValue={p.ctaTexte}
                      className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] transition-colors"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#111] text-white text-[12px] font-bold rounded hover:bg-[#E53935] transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          ))
        )}
      </div>

      {/* Créer un nouveau partenaire */}
      <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F0F0F0]">
          <h2 className="text-[14px] font-bold text-[#111]">Ajouter un espace partenaire</h2>
        </div>
        <form action={createPartenaire} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-[#bbb] mb-1.5">Titre *</label>
              <input
                type="text"
                name="titre"
                required
                placeholder="Nom du partenaire"
                className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-[#bbb] mb-1.5">Position</label>
              <select
                name="position"
                className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] bg-white"
              >
                <option value="home">Page d&apos;accueil</option>
                <option value="article">Pages article</option>
                <option value="categorie">Pages catégorie</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-[#bbb] mb-1.5">Sous-titre</label>
              <input
                type="text"
                name="sousTitre"
                className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-[#bbb] mb-1.5">Lien CTA</label>
              <input
                type="url"
                name="lien"
                placeholder="https://..."
                className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] transition-colors"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#111] text-white text-[12px] font-bold rounded hover:bg-[#E53935] transition-colors"
          >
            Créer l&apos;espace partenaire
          </button>
        </form>
      </div>
    </div>
  );
}
