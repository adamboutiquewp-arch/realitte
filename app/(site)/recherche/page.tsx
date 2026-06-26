import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import type { ArticleCard as ArticleCardType } from "@/types";
import ArticleCard from "@/components/article/ArticleCard";

const ITEMS_PER_PAGE = 18;

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  if (!q) {
    return {
      title: "Recherche — Réalitte",
      description: "Recherchez parmi tous les articles de Réalitte.",
      robots: { index: false },
    };
  }
  return {
    title: `"${q}" — Recherche Réalitte`,
    robots: { index: false },
  };
}

export default async function RecherchePage({ searchParams }: Props) {
  const { q, page: pageParam } = await searchParams;
  const query = q?.trim() || "";
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  let articles: ArticleCardType[] = [];
  let totalCount = 0;

  if (query.length >= 2) {
    // Recherche dans titre, chapo, tags et contenu
    const where = {
      statut: "PUBLISHED" as const,
      OR: [
        { titre:  { contains: query, mode: "insensitive" as const } },
        { chapo:  { contains: query, mode: "insensitive" as const } },
        { contenu:{ contains: query, mode: "insensitive" as const } },
        { tags:   { has: query } },
      ],
    };

    const [results, count] = await Promise.all([
      prisma.article.findMany({
        where,
        include: { categorie: true },
        orderBy: { datePublication: "desc" },
        skip,
        take: ITEMS_PER_PAGE,
      }),
      prisma.article.count({ where }),
    ]);

    totalCount = count;
    articles = results.map(mapToCard);
  }

  // Articles populaires quand pas de recherche
  const popular = query.length < 2
    ? await prisma.article.findMany({
        where: { statut: "PUBLISHED" },
        include: { categorie: true },
        orderBy: { vues: "desc" },
        take: 6,
      }).then((r) => r.map(mapToCard))
    : [];

  // Tags tendance quand pas de recherche
  const trendingTags = query.length < 2
    ? await prisma.article.findMany({
        where: { statut: "PUBLISHED" },
        select: { tags: true },
        orderBy: { datePublication: "desc" },
        take: 50,
      }).then((rows) => {
        const freq = new Map<string, number>();
        for (const row of rows)
          for (const tag of row.tags)
            freq.set(tag, (freq.get(tag) ?? 0) + 1);
        return [...freq.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)
          .map(([tag]) => tag);
      })
    : [];

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  function buildUrl(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (p > 1) params.set("page", String(p));
    return `/recherche?${params.toString()}`;
  }

  return (
    <div className="container-site py-10 md:py-14">
      {/* ── Barre de recherche ── */}
      <div className="mb-10 max-w-2xl">
        <h1 className="text-[11px] font-bold tracking-widest uppercase text-[#9E9E9E] mb-4">
          Recherche
        </h1>
        <form method="GET" action="/recherche">
          <div className="flex gap-0">
            <input
              name="q"
              defaultValue={query}
              placeholder="Rechercher un article, un sujet, un tag…"
              autoFocus
              className="flex-1 px-4 py-3 border border-[#E0E0E0] border-r-0 text-[14px] focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white text-[11px] font-bold tracking-widest uppercase hover:bg-[#E53935] transition-colors whitespace-nowrap"
            >
              Chercher
            </button>
          </div>
        </form>
      </div>

      {/* ── Résultats de recherche ── */}
      {query.length >= 2 ? (
        <>
          <p className="text-[13px] text-[#9E9E9E] mb-8 pb-6 border-b border-[#E0E0E0]">
            {totalCount === 0
              ? <>Aucun résultat pour <strong className="text-[#111]">« {query} »</strong></>
              : <><strong className="text-[#111]">{totalCount}</strong> résultat{totalCount > 1 ? "s" : ""} pour <strong className="text-[#111]">« {query} »</strong>{currentPage > 1 && ` — page ${currentPage}`}</>
            }
          </p>

          {articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {articles.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="grid" showDate />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-1 mt-8 pt-8 border-t border-[#E0E0E0]">
                  {currentPage > 1 && (
                    <Link href={buildUrl(currentPage - 1)}
                      className="px-4 py-2 text-[11px] font-bold tracking-widest uppercase border border-[#E0E0E0] hover:border-[#E53935] hover:text-[#E53935] transition-colors">
                      ← Précédent
                    </Link>
                  )}
                  <span className="mx-4 text-[13px] text-[#9E9E9E]">
                    Page {currentPage} / {totalPages}
                  </span>
                  {currentPage < totalPages && (
                    <Link href={buildUrl(currentPage + 1)}
                      className="px-4 py-2 text-[11px] font-bold tracking-widest uppercase border border-[#E0E0E0] hover:border-[#E53935] hover:text-[#E53935] transition-colors">
                      Suivant →
                    </Link>
                  )}
                </nav>
              )}
            </>
          ) : (
            /* Aucun résultat — suggestions */
            <div className="py-10">
              <p className="text-[14px] text-[#424242] mb-8">
                Essayez d&apos;autres mots-clés ou explorez nos rubriques :
              </p>
              <div className="flex flex-wrap gap-3">
                {["Actu", "Sport", "Politique", "Économie", "People", "Créateurs"].map((cat) => (
                  <Link key={cat} href={`/${cat.toLowerCase()}`}
                    className="px-4 py-2 border border-[#E0E0E0] text-[12px] font-bold tracking-widest uppercase hover:border-[#E53935] hover:text-[#E53935] transition-colors">
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* ── Page vide : populaires + tags tendance ── */
        <>
          {/* Tags tendance */}
          {trendingTags.length > 0 && (
            <div className="mb-12">
              <h2 className="text-[11px] font-bold tracking-widest uppercase text-[#9E9E9E] mb-4">
                Sujets tendance
              </h2>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag) => (
                  <Link key={tag} href={`/recherche?q=${encodeURIComponent(tag)}`}
                    className="px-3 py-1.5 border border-[#E0E0E0] text-[11px] font-medium text-[#424242] tracking-wide hover:border-[#E53935] hover:text-[#E53935] transition-colors">
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Articles les plus lus */}
          {popular.length > 0 && (
            <div>
              <h2 className="text-[11px] font-bold tracking-widest uppercase text-[#E53935] mb-6">
                Les plus lus
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {popular.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="grid" showDate />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function mapToCard(a: {
  id: string;
  titre: string;
  slug: string;
  chapo: string;
  imageUrl: string | null;
  imageAlt: string | null;
  imageClean: boolean;
  sousCategorie: string | null;
  tags: string[];
  datePublication: Date | null;
  tempsLecture: number | null;
  vues: number;
  categorie: { nom: string; slug: string; couleur: string };
}): ArticleCardType {
  return {
    id: a.id,
    titre: a.titre,
    slug: a.slug,
    chapo: a.chapo,
    imageUrl: a.imageUrl,
    imageAlt: a.imageAlt,
    imageClean: a.imageClean,
    sousCategorie: a.sousCategorie,
    tags: a.tags,
    datePublication: a.datePublication,
    tempsLecture: a.tempsLecture,
    vues: a.vues,
    categorie: { nom: a.categorie.nom, slug: a.categorie.slug, couleur: a.categorie.couleur },
  };
}
