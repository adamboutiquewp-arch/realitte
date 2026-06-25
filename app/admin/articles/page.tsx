import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import DeleteArticleButton from "@/components/admin/DeleteArticleButton";
import FeaturedCategorieButton from "@/components/admin/FeaturedCategorieButton";
import ToggleArticleButton from "@/components/admin/ToggleArticleButton";
import FacebookPostButton from "@/components/admin/FacebookPostButton";

export const metadata: Metadata = { title: "Articles" };
export const dynamic = "force-dynamic";

const STATUTS = [
  { value: "",          label: "Tous",       color: "#666" },
  { value: "PENDING",   label: "En attente", color: "#E53935" },
  { value: "PUBLISHED", label: "Publiés",    color: "#16A34A" },
  { value: "DRAFT",     label: "Brouillons", color: "#777" },
  { value: "REJECTED",  label: "Rejetés",    color: "#DC2626" },
];

const STATUT_STYLE: Record<string, string> = {
  PENDING:   "bg-orange-50 text-orange-700 border border-orange-200",
  PUBLISHED: "bg-green-50  text-green-700  border border-green-200",
  DRAFT:     "bg-gray-100  text-gray-600   border border-gray-200",
  REJECTED:  "bg-red-50    text-red-700    border border-red-200",
};

const STATUT_LABEL: Record<string, string> = {
  PENDING:   "En attente",
  PUBLISHED: "Publié",
  DRAFT:     "Brouillon",
  REJECTED:  "Rejeté",
};

interface PageProps {
  searchParams: Promise<{ statut?: string; cat?: string; page?: string }>;
}

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const { statut, cat, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1"));
  const perPage = 20;
  const skip = (currentPage - 1) * perPage;

  const where: Record<string, unknown> = {};
  if (statut) where.statut = statut;
  if (cat) where.categorie = { slug: cat };

  const [articles, total, categories] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { categorie: { select: { nom: true, couleur: true, slug: true } } },
      orderBy: { dateCreation: "desc" },
      take: perPage,
      skip,
    }),
    prisma.article.count({ where }),
    prisma.categorie.findMany({ orderBy: { ordre: "asc" } }),
  ]);

  const pages = Math.ceil(total / perPage);

  const buildUrl = (params: Record<string, string>) => {
    const sp = new URLSearchParams();
    if (statut) sp.set("statut", statut);
    if (cat) sp.set("cat", cat);
    sp.set("page", "1");
    Object.entries(params).forEach(([k, v]) => (v ? sp.set(k, v) : sp.delete(k)));
    const query = sp.toString();
    return `/admin/articles${query ? `?${query}` : ""}`;
  };

  return (
    <div className="max-w-[1100px]">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-black text-[#111]">Articles</h1>
          <p className="text-[13px] text-[#999] mt-0.5">
            {total} article{total > 1 ? "s" : ""} au total
          </p>
        </div>
      </div>

      {/* Filtres statut */}
      <div className="bg-white rounded-xl border border-[#EBEBEB] p-4 mb-5">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#bbb] mr-1">Statut</span>
          {STATUTS.map((s) => {
            const active = statut === s.value || (!statut && !s.value);
            return (
              <Link
                key={s.value}
                href={buildUrl({ statut: s.value })}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                  active
                    ? "bg-[#111] text-white"
                    : "bg-[#F5F5F5] text-[#666] hover:bg-[#EBEBEB]"
                }`}
              >
                {s.label}
              </Link>
            );
          })}

          {/* Filtre catégorie par liens */}
          {categories.length > 0 && (
            <>
              <span className="text-[#E0E0E0] mx-1">|</span>
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#bbb] mr-1">Catégorie</span>
              <Link
                href={buildUrl({ cat: "" })}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                  !cat ? "bg-[#111] text-white" : "bg-[#F5F5F5] text-[#666] hover:bg-[#EBEBEB]"
                }`}
              >
                Toutes
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={buildUrl({ cat: c.slug })}
                  className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                    cat === c.slug
                      ? "text-white"
                      : "bg-[#F5F5F5] text-[#666] hover:bg-[#EBEBEB]"
                  }`}
                  style={cat === c.slug ? { backgroundColor: c.couleur } : {}}
                >
                  {c.nom}
                </Link>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
        {articles.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[14px] text-[#bbb]">Aucun article trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#F0F0F0]">
                  <th className="text-left px-6 py-3.5 text-[11px] font-bold tracking-wider uppercase text-[#bbb]">Article</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold tracking-wider uppercase text-[#bbb] hidden md:table-cell">Catégorie</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold tracking-wider uppercase text-[#bbb]">Statut</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold tracking-wider uppercase text-[#bbb] hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3.5 text-right text-[11px] font-bold tracking-wider uppercase text-[#bbb]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F8F8]">
                {articles.map((a) => (
                  <tr key={a.id} className="hover:bg-[#FAFAFA] transition-colors group">
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-semibold text-[#111] line-clamp-1">{a.titre}</p>
                      <p className="text-[11px] text-[#bbb] mt-0.5 line-clamp-1">{a.chapo}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span
                        className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded"
                        style={{
                          color: a.categorie.couleur,
                          backgroundColor: `${a.categorie.couleur}18`,
                        }}
                      >
                        {a.categorie.nom}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded ${STATUT_STYLE[a.statut]}`}>
                        {STATUT_LABEL[a.statut]}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-[#bbb] text-[12px]">
                      {formatDate(a.dateCreation)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {(a.statut === "PUBLISHED" || a.statut === "DRAFT") && (
                          <ToggleArticleButton id={a.id} statut={a.statut} />
                        )}
                        {a.statut === "PUBLISHED" && (
                          <FeaturedCategorieButton
                            id={a.id}
                            categorieId={a.categorieId}
                            featuredCategorie={a.featuredCategorie}
                            categorieNom={a.categorie.nom}
                            categorieColor={a.categorie.couleur}
                          />
                        )}
                        {a.statut === "PUBLISHED" && (
                          <FacebookPostButton article={{ id: a.id, titre: a.titre, chapo: a.chapo, slug: a.slug, tags: a.tags, categorie: { slug: a.categorie.slug } }} variant="list" />
                        )}
                        {a.statut === "PUBLISHED" && (
                          <Link
                            href={`/${a.categorie.slug}/${a.slug}`}
                            target="_blank"
                            className="text-[11px] font-medium text-[#bbb] hover:text-[#111] transition-colors"
                          >
                            Voir ↗
                          </Link>
                        )}
                        <Link
                          href={`/admin/articles/${a.id}`}
                          className="px-3 py-1.5 bg-[#111] text-white text-[11px] font-bold rounded hover:bg-[#E53935] transition-colors"
                        >
                          Éditer
                        </Link>
                        <DeleteArticleButton id={a.id} titre={a.titre} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildUrl({ page: String(p) })}
              className={`w-9 h-9 flex items-center justify-center text-[13px] font-bold rounded transition-all ${
                p === currentPage
                  ? "bg-[#111] text-white"
                  : "bg-white text-[#666] border border-[#EBEBEB] hover:border-[#111]"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
