import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/article/ArticleCard";
import EspacePartenaire from "@/components/home/EspacePartenaire";
import SuccessStories from "@/components/home/SuccessStories";
import SubCategoryNav from "./SubCategoryNav";
import type { ArticleCard as ArticleCardType } from "@/types";

const SOUS_CATEGORIES: Record<string, string[]> = {
  sport:           ["Tout", "Football", "Basket", "Tennis", "F1", "Rugby"],
  economie:        ["Tout", "Finance", "Entreprises", "Marchés", "Emploi"],
  politique:       ["Tout", "France", "International", "Élections", "Social"],
  "success-stories":["Tout", "Entrepreneuriat", "Innovation", "Persévérance", "Sport"],
  actu:            ["Tout", "France", "Monde", "Société", "Santé"],
  people:          ["Tout", "Célébrités", "Royauté", "Cinéma", "Musique", "Télé"],
  "sante-beaute":  ["Tout", "Santé", "Beauté", "Bien-être", "Nutrition", "Forme"],
  "fait-divers":   ["Tout", "Crimes", "Accidents", "Justice", "Disparitions"],
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
    // Une de la catégorie : article featuredCategorie en priorité, sinon le plus récent
    prisma.article.findFirst({
      where: { statut: "PUBLISHED", categorieId: categorie.id },
      orderBy: [{ featuredCategorie: "desc" }, { datePublication: "desc" }],
    }),
    prisma.article.findMany({
      where: { statut: "PUBLISHED", categorieId: categorie.id, ...sousCatFilter },
      include: { categorie: true },
      orderBy: [{ featuredCategorie: "desc" }, { datePublication: "desc" }],
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
      <section className="relative bg-black overflow-hidden min-h-[260px] sm:min-h-[380px] md:min-h-[460px]">
        {heroArticle?.imageUrl && (
          <div className="absolute inset-0">
            <Image
              src={heroArticle.imageUrl}
              alt={heroArticle.titre}
              fill
              priority
              className="object-cover object-top opacity-90"
              sizes="100vw"
            />
          </div>
        )}
        {/* Overlay léger — dégradé du bas uniquement */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.05) 100%)"
        }} />

        <div className="container-site relative z-10 flex flex-col justify-end min-h-[260px] sm:min-h-[380px] md:min-h-[460px] px-5 sm:px-8 pb-7 sm:pb-12 pt-6">
          {/* Badge catégorie */}
          <div className="inline-flex items-center px-3 py-1.5 mb-3 self-start" style={{ backgroundColor: categorie.couleur }}>
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">
              {categorie.nom}
            </span>
          </div>

          {heroArticle ? (
            /* Article en une */
            <div className="max-w-[520px]">
              <h1
                className="text-white font-black leading-[1.05] tracking-tight mb-2 sm:mb-4"
                style={{ fontSize: "clamp(20px, 4vw, 44px)" }}
              >
                {heroArticle.titre}
              </h1>
              {heroArticle.chapo && (
                <p className="text-white/75 text-[13px] sm:text-[15px] leading-relaxed mb-4 line-clamp-2 hidden sm:block">
                  {heroArticle.chapo}
                </p>
              )}
              <Link
                href={`/${catSlug}/${heroArticle.slug}`}
                className="inline-flex items-center px-5 py-3 bg-white text-black text-[11px] font-bold tracking-widest uppercase hover:bg-[#E53935] hover:text-white transition-colors w-full sm:w-auto justify-center sm:justify-start"
              >
                Lire l&apos;article
              </Link>
            </div>
          ) : (
            /* Fallback si aucun article */
            <div className="max-w-[520px]">
              <h1
                className="text-white font-black leading-tight tracking-tight mb-2"
                style={{ fontSize: "clamp(20px, 4vw, 44px)" }}
              >
                {getHeroTitle(catSlug)}
              </h1>
              <p className="text-white/70 text-[14px] hidden sm:block">{getHeroSubtitle(catSlug)}</p>
            </div>
          )}
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
    actu:              "L'actualité brute, vérifiée et sourcée.",
    people:            "Le monde des célébrités sans détour.",
    "sante-beaute":    "Prenez soin de vous, chaque jour.",
    "fait-divers":     "Les faits qui ont marqué l'actualité.",
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
    actu:              "France, monde, société : l'information vérifiée et sourcée.",
    people:            "Stars, royauté, cinéma, musique : toute l'actu de vos célébrités préférées.",
    "sante-beaute":    "Conseils santé, tendances beauté et bien-être pour prendre soin de vous.",
    "fait-divers":     "Crimes, accidents, justice : les affaires qui ont choqué la France.",
  };
  return subtitles[slug] || "Retrouvez tous nos articles sur ce sujet.";
}
