import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Articles" };
export const dynamic = "force-dynamic";

const STATUTS = [
  { value: "",          label: "Tous" },
  { value: "PENDING",   label: "En attente" },
  { value: "PUBLISHED", label: "Publiés" },
  { value: "DRAFT",     label: "Brouillons" },
  { value: "REJECTED",  label: "Rejetés" },
];

const STATUT_BADGE: Record<string, string> = {
  PENDING:   "bg-[#FFF3CD] text-[#856404]",
  PUBLISHED: "bg-[#D4EDDA] text-[#155724]",
  DRAFT:     "bg-[#E2E3E5] text-[#383D41]",
  REJECTED:  "bg-[#F8D7DA] text-[#721C24]",
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
      include: { categorie: { select: { nom: true, couleur: true } } },
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
    return `/admin/articles?${sp.toString()}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#111111]">Articles</h1>
          <p className="text-[13px] text-[#9E9E9E]">{total} article{total > 1 ? "s" : ""} au total</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 flex-wrap">
          {STATUTS.map((s) => (
            <Link
              key={s.value}
              href={buildUrl({ statut: s.value })}
              className={`px-4 py-2 text-[12px] font-bold tracking-wider uppercase transition-colors ${
                statut === s.value || (!statut && !s.value)
                  ? "bg-black text-white"
                  : "bg-[#F5F5F5] text-[#424242] hover:bg-[#E0E0E0]"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        <select
          onChange={(e) => {
            window.location.href = buildUrl({ cat: e.target.value });
          }}
          defaultValue={cat || ""}
          className="ml-auto px-3 py-2 border border-[#E0E0E0] text-[13px] outline-none focus:border-black"
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.nom}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b-2 border-[#E0E0E0]">
              <th className="text-left px-5 py-4 text-[11px] font-bold tracking-widest uppercase text-[#9E9E9E]">Article</th>
              <th className="text-left px-4 py-4 text-[11px] font-bold tracking-widest uppercase text-[#9E9E9E] hidden md:table-cell">Catégorie</th>
              <th className="text-left px-4 py-4 text-[11px] font-bold tracking-widest uppercase text-[#9E9E9E] hidden lg:table-cell">Statut</th>
              <th className="text-left px-4 py-4 text-[11px] font-bold tracking-widest uppercase text-[#9E9E9E] hidden lg:table-cell">Date</th>
              <th className="text-left px-4 py-4 text-[11px] font-bold tracking-widest uppercase text-[#9E9E9E]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F5F5]">
            {articles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-[#9E9E9E]">
                  Aucun article trouvé.
                </td>
              </tr>
            ) : (
              articles.map((a) => (
                <tr key={a.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#111111] line-clamp-1 max-w-sm">{a.titre}</p>
                    <p className="text-[11px] text-[#9E9E9E] mt-0.5 line-clamp-1">{a.chapo}</p>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span
                      className="text-[11px] font-bold tracking-widest uppercase"
                      style={{ color: a.categorie.couleur }}
                    >
                      {a.categorie.nom}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className={`px-2.5 py-1 text-[11px] font-bold ${STATUT_BADGE[a.statut]}`}>
                      {STATUT_LABEL[a.statut]}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell text-[#9E9E9E]">
                    {formatDate(a.dateCreation)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/articles/${a.id}`}
                        className="px-3 py-1.5 bg-black text-white text-[11px] font-bold tracking-wider uppercase hover:bg-[#333] transition-colors"
                      >
                        Éditer
                      </Link>
                      {a.statut === "PUBLISHED" && (
                        <Link
                          href={`/${a.categorie.nom.toLowerCase()}/${a.slug}`}
                          target="_blank"
                          className="px-3 py-1.5 border border-[#E0E0E0] text-[11px] font-bold tracking-wider uppercase text-[#424242] hover:border-black transition-colors"
                        >
                          Voir
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildUrl({ page: String(p) })}
              className={`w-9 h-9 flex items-center justify-center text-[13px] font-bold transition-colors ${
                p === currentPage
                  ? "bg-black text-white"
                  : "bg-white text-[#424242] border border-[#E0E0E0] hover:border-black"
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
