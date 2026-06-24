import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/article/ArticleCard";
import EspacePartenaire from "@/components/home/EspacePartenaire";
import SuccessStories from "@/components/home/SuccessStories";
import SubCategoryNav from "./SubCategoryNav";
import type { ArticleCard as ArticleCardType } from "@/types";

const SOUS_CATEGORIES: Record<string, string[]> = {
  sport:    ["Tout", "Football", "Basket", "Tennis", "F1", "Rugby"],
  economie: ["Tout", "Finance", "Entreprises", "Marchés", "Emploi"],
  politique:["Tout", "France", "International", "Élections", "Social"],
  anecdote: ["Tout", "Société", "Insolite", "Histoire", "Vie"],
  "success-stories": ["Tout", "Entrepreneuriat", "Innovation", "Persévérance", "Sport"],
  actu:     ["Tout", "France", "Monde", "Société", "Santé"],
};

interface PageProps {
  params: Promise<{ categorie: string }>;
  searchParams: Promise<{ sous?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorie: catSlug } = await params;
  const cat = await prisma.categorie.findUnique({ where: { slug: catSlug } });
  if (!cat) return { title: "Catégorie introuvable" };
  return {
    title: `${cat.nom} — Réalitte`,
    description: `Toute l'actualité ${cat.nom} sur Réalitte.`,
  };
}

export const revalidate = 300;

export default async function CategoriePage({ params, searchParams }: PageProps) {
  const { categorie: catSlug } = await params;
  const { sous } = await searchParams;

  const categorie = await prisma.categorie.findUnique({ where: { slug: catSlug } });
  if (!categorie) notFound();

  const sousCatFilter =
    sous && sous !== "Tout" ? { sousCategorie: sous } : {};

  const [heroArticle, articles] = await Promise.all([
    prisma.article.findFirst({
      where: { statut: "PUBLISHED", categorieId: categorie.id },
      orderBy: { datePublication: "desc" },
    }),
    prisma.article.findMany({
      where: { statut: "PUBLISHED", categorieId: categorie.id, ...sousCatFilter },
      include: { categorie: true },
      orderBy: { datePublication: "desc" },
      take: 20,
    }),
  ]);

  const sousCats = SOUS_CATEGORIES[catSlug] || ["Tout"];

  const mappedArticles: ArticleCardType[] = articles.map((a) => ({
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
    categorie: {
      nom: a.categorie.nom,
      slug: a.categorie.slug,
      couleur: a.categorie.couleur,
    },
  }));

  return (
    <>
      {/* ── Hero catégorie ── */}
      <section className="relative bg-black overflow-hidden" style={{ minHeight: 320 }}>
        {heroArticle?.imageUrl && (
          <div className="absolute inset-0">
            <Image
              src={heroArticle.imageUrl}
              alt={categorie.nom}
              fill
              priority
              className="object-cover opacity-40"
              sizes="100vw"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

        <div className="container-site relative z-10 py-14 md:py-20 flex flex-col justify-center min-h-[320px]">
          <div className="inline-flex items-center px-3 py-1 mb-5" style={{ backgroundColor: categorie.couleur }}>
            <span className="text-[11px] font-bold tracking-widest uppercase text-white">
              {categorie.nom}
            </span>
          </div>
          <h1 className="text-white text-3xl md:text-5xl font-black tracking-tight mb-3 max-w-xl">
            {getHeroTitle(catSlug)}
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-lg">
            {getHeroSubtitle(catSlug)}
          </p>
        </div>
      </section>

      {/* ── Sous-navigation ── */}
      <SubCategoryNav items={sousCats} current={sous || "Tout"} catSlug={catSlug} couleur={categorie.couleur} />

      {/* ── Liste articles + sidebar ── */}
      <div className="container-site py-10 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
          {/* Articles */}
          <div>
            {mappedArticles.length === 0 ? (
              <div className="py-16 text-center text-[#9E9E9E]">
                <p className="text-lg font-semibold mb-2">Aucun article pour le moment</p>
                <p className="text-sm">Le contenu arrive bientôt.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[#E0E0E0]">
                {mappedArticles.map((article) => (
                  <li key={article.id}>
                    <ArticleCard article={article} variant="list" showDate />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Sidebar desktop */}
          <aside className="hidden lg:block pl-8 border-l border-[#E0E0E0]">
            <EspacePartenaire />
          </aside>
        </div>

        {/* Espace partenaire mobile */}
        <div className="lg:hidden mt-8">
          <EspacePartenaire />
        </div>

        {/* Success Stories en bas */}
        {catSlug !== "success-stories" && (
          <SuccessStoriesSection catId={categorie.id} />
        )}
      </div>
    </>
  );
}

async function SuccessStoriesSection({ catId }: { catId: string }) {
  const ssCategory = await prisma.categorie.findUnique({
    where: { slug: "success-stories" },
  });
  if (!ssCategory) return null;

  const articles = await prisma.article.findMany({
    where: { statut: "PUBLISHED", categorieId: ssCategory.id },
    include: { categorie: true },
    orderBy: { datePublication: "desc" },
    take: 3,
  });

  if (articles.length === 0) return null;

  const mapped: ArticleCardType[] = articles.map((a) => ({
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
    categorie: {
      nom: a.categorie.nom,
      slug: a.categorie.slug,
      couleur: a.categorie.couleur,
    },
  }));

  return (
    <div className="mt-12 pt-8 border-t border-[#E0E0E0]">
      <SuccessStories articles={mapped} />
    </div>
  );
}

function getHeroTitle(slug: string): string {
  const titles: Record<string, string> = {
    sport:    "Votre dose quotidienne de passion et de performance.",
    economie: "L'économie expliquée, sans langue de bois.",
    politique:"La politique décryptée, sans filtre.",
    anecdote: "Les histoires qui font l'humanité.",
    "success-stories": "Ceux qui ont transformé leur vie.",
    actu:     "L'actualité brute, vérifiée et sourcée.",
  };
  return titles[slug] || "Toute l'actualité.";
}

function getHeroSubtitle(slug: string): string {
  const subtitles: Record<string, string> = {
    sport:    "Résultats, analyses, coulisses et enjeux : tout le sport, sans filtre.",
    economie: "Marchés, entreprises, emploi : l'essentiel pour comprendre le monde économique.",
    politique:"Réformes, élections, coulisses du pouvoir : l'analyse qui compte.",
    anecdote: "Ces histoires vraies qui vous surprendront, vous toucheront, vous inspireront.",
    "success-stories": "Des parcours extraordinaires qui prouvent que tout est possible.",
    actu:     "France, monde, société : l'information vérifiée et sourcée.",
  };
  return subtitles[slug] || "Retrouvez tous nos articles sur ce sujet.";
}
