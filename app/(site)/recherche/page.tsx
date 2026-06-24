import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/article/ArticleCard";
import type { ArticleCard as ArticleCardType } from "@/types";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Recherche : "${q}"` : "Recherche",
    robots: { index: false },
  };
}

export default async function RecherchePage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  let articles: ArticleCardType[] = [];

  if (query.length >= 2) {
    const results = await prisma.article.findMany({
      where: {
        statut: "PUBLISHED",
        OR: [
          { titre: { contains: query, mode: "insensitive" } },
          { chapo: { contains: query, mode: "insensitive" } },
          { tags: { has: query } },
        ],
      },
      include: { categorie: true },
      orderBy: { datePublication: "desc" },
      take: 20,
    });

    articles = results.map((a) => ({
      id: a.id,
      titre: a.titre,
      slug: a.slug,
      chapo: a.chapo,
      imageUrl: a.imageUrl,
      imageAlt: a.imageAlt,
      sousCategorie: a.sousCategorie,
      tags: a.tags,
      datePublication: a.datePublication,
      tempsLecture: a.tempsLecture,
      vues: a.vues,
      categorie: { nom: a.categorie.nom, slug: a.categorie.slug, couleur: a.categorie.couleur },
    }));
  }

  return (
    <div className="container-site py-10">
      {/* Barre de recherche */}
      <form method="GET" action="/recherche" className="mb-10">
        <div className="flex gap-0 max-w-xl">
          <input
            name="q"
            defaultValue={query}
            placeholder="Rechercher un article..."
            autoFocus
            className="flex-1 px-4 py-3 border border-[#E0E0E0] border-r-0 text-[14px] focus:outline-none focus:border-black"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-black text-white text-[12px] font-bold tracking-widest uppercase hover:bg-[#E53935] transition-colors"
          >
            Chercher
          </button>
        </div>
      </form>

      {/* Résultats */}
      {query.length >= 2 ? (
        <>
          <p className="text-[13px] text-[#9E9E9E] mb-6">
            {articles.length === 0
              ? `Aucun résultat pour « ${query} »`
              : `${articles.length} résultat${articles.length > 1 ? "s" : ""} pour « ${query} »`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} variant="grid" showDate />
            ))}
          </div>
        </>
      ) : (
        <p className="text-[15px] text-[#9E9E9E]">
          Tape au moins 2 caractères pour lancer une recherche.
        </p>
      )}
    </div>
  );
}
