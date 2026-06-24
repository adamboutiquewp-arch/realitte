import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/article/ArticleCard";
import type { ArticleCard as ArticleCardType } from "@/types";

export const metadata: Metadata = {
  title: "Explorer — Réalitte",
  description: "Parcourez toutes les rubriques de Réalitte : Actu, Sport, Économie, Politique, Anecdote, Success Stories.",
};

export const revalidate = 300;

export default async function ExplorerPage() {
  const categories = await prisma.categorie.findMany({ orderBy: { ordre: "asc" } });

  const categoriesWithArticles = await Promise.all(
    categories.map(async (cat) => {
      const articles = await prisma.article.findMany({
        where: { statut: "PUBLISHED", categorieId: cat.id },
        include: { categorie: true },
        orderBy: [{ featuredCategorie: "desc" }, { datePublication: "desc" }],
        take: 4,
      });
      return { categorie: cat, articles };
    })
  );

  const mapToCard = (a: typeof categoriesWithArticles[0]["articles"][0]): ArticleCardType => ({
    id: a.id, titre: a.titre, slug: a.slug, chapo: a.chapo,
    imageUrl: a.imageUrl, imageAlt: a.imageAlt, sousCategorie: a.sousCategorie,
    tags: a.tags, datePublication: a.datePublication, tempsLecture: a.tempsLecture,
    vues: a.vues,
    categorie: { nom: a.categorie.nom, slug: a.categorie.slug, couleur: a.categorie.couleur },
  });

  return (
    <div className="container-site py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-[28px] md:text-[36px] font-black tracking-tight uppercase mb-2">Explorer</h1>
        <p className="text-[14px] text-[#9E9E9E]">Toutes les rubriques de Réalitte</p>
      </div>

      {/* Catégories pills */}
      <div className="flex flex-wrap gap-2 mb-8 md:mb-12">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/${cat.slug}`}
            className="px-4 py-2 rounded-full text-[12px] font-bold tracking-wide text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: cat.couleur }}
          >
            {cat.nom}
          </Link>
        ))}
      </div>

      {/* Sections par catégorie */}
      <div className="space-y-12">
        {categoriesWithArticles.map(({ categorie, articles }) => {
          if (articles.length === 0) return null;
          return (
            <section key={categorie.id}>
              {/* Titre rubrique */}
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-1 h-6 rounded-full" style={{ backgroundColor: categorie.couleur }} />
                  <h2
                    className="text-[18px] md:text-[22px] font-black tracking-tight uppercase"
                    style={{ color: categorie.couleur }}
                  >
                    {categorie.nom}
                  </h2>
                </div>
                <Link
                  href={`/${categorie.slug}`}
                  className="text-[11px] font-bold tracking-widest uppercase text-[#9E9E9E] hover:text-[#111] transition-colors"
                >
                  Voir tout →
                </Link>
              </div>

              {/* Grille : 2 colonnes mobile, 4 desktop */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {articles.map((a) => (
                  <ArticleCard key={a.id} article={mapToCard(a)} variant="grid" />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
