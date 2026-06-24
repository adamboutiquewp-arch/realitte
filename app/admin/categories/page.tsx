import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Catégories" };
export const dynamic = "force-dynamic";

const COULEURS_PRESET = [
  "#E53935", "#C62828", "#1565C0", "#0D47A1",
  "#2E7D32", "#1B5E20", "#C9A84C", "#F57F17",
  "#6A1B9A", "#4A148C", "#00838F", "#006064",
];

async function createCategorie(formData: FormData) {
  "use server";
  const nom = (formData.get("nom") as string)?.trim();
  const couleur = (formData.get("couleur") as string)?.trim() || "#E53935";
  const ordre = parseInt(formData.get("ordre") as string) || 0;

  if (!nom) return;

  const slug = nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  await prisma.categorie.create({
    data: { nom, slug, couleur, ordre },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

async function deleteCategorie(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;

  const count = await prisma.article.count({ where: { categorieId: id } });
  if (count > 0) {
    redirect("/admin/categories?error=articles_existants");
  }

  await prisma.categorie.delete({ where: { id } });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  const categories = await prisma.categorie.findMany({
    orderBy: { ordre: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div className="max-w-[800px]">
      <div className="mb-8">
        <h1 className="text-[22px] font-black text-[#111]">Catégories</h1>
        <p className="text-[13px] text-[#999] mt-0.5">{categories.length} catégorie{categories.length > 1 ? "s" : ""}</p>
      </div>

      {error === "articles_existants" && (
        <div className="mb-6 px-4 py-3 bg-[#FEE2E2] border border-[#E53935]/20 rounded-lg text-[13px] text-[#c62828] font-medium">
          Impossible de supprimer : cette catégorie contient des articles.
        </div>
      )}

      {/* Liste */}
      <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-[#F0F0F0]">
          <h2 className="text-[14px] font-bold text-[#111]">Toutes les catégories</h2>
        </div>

        {categories.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-[13px] text-[#bbb]">Aucune catégorie. Créez-en une ci-dessous.</p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#F0F0F0]">
                <th className="text-left px-6 py-3 text-[11px] font-bold tracking-wider uppercase text-[#bbb]">Nom</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-[#bbb]">Slug</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-[#bbb] hidden sm:table-cell">Couleur</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-[#bbb]">Articles</th>
                <th className="px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-[#bbb]">Ordre</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8F8F8]">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.couleur }}
                      />
                      <span className="font-semibold text-[#111]">{cat.nom}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[#999] font-mono text-[12px]">{cat.slug}</td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded border border-black/10"
                        style={{ backgroundColor: cat.couleur }}
                      />
                      <span className="text-[#999] font-mono text-[11px]">{cat.couleur}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[12px] font-bold text-[#666] bg-[#F5F5F5] px-2 py-0.5 rounded">
                      {cat._count.articles}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-[#999]">{cat.ordre}</td>
                  <td className="px-4 py-4 text-right">
                    {cat._count.articles === 0 && (
                      <form action={deleteCategorie}>
                        <input type="hidden" name="id" value={cat.id} />
                        <button
                          type="submit"
                          className="text-[12px] text-[#bbb] hover:text-[#E53935] font-medium transition-colors"
                          onClick={(e) => {
                            if (!confirm(`Supprimer "${cat.nom}" ?`)) e.preventDefault();
                          }}
                        >
                          Supprimer
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Formulaire ajout */}
      <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F0F0F0]">
          <h2 className="text-[14px] font-bold text-[#111]">Ajouter une catégorie</h2>
        </div>
        <form action={createCategorie} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-[#999] mb-2">
                Nom *
              </label>
              <input
                type="text"
                name="nom"
                required
                placeholder="Ex: Sport, Politique…"
                className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] transition-colors"
              />
              <p className="text-[11px] text-[#bbb] mt-1">Le slug sera généré automatiquement</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-[#999] mb-2">
                Ordre d&apos;affichage
              </label>
              <input
                type="number"
                name="ordre"
                defaultValue={categories.length}
                min={0}
                className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-[#999] mb-2">
              Couleur
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {COULEURS_PRESET.map((c) => (
                <label key={c} className="cursor-pointer">
                  <input type="radio" name="couleur" value={c} className="sr-only peer" />
                  <span
                    className="w-7 h-7 rounded-full block ring-2 ring-transparent peer-checked:ring-offset-2 peer-checked:ring-[#111] transition-all"
                    style={{ backgroundColor: c }}
                  />
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-[#999]">Couleur personnalisée :</label>
              <input
                type="color"
                name="couleur"
                defaultValue="#E53935"
                className="w-8 h-8 rounded cursor-pointer border border-[#E8E8E8]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#111] text-white text-[13px] font-bold rounded hover:bg-[#E53935] transition-colors"
            >
              Créer la catégorie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
