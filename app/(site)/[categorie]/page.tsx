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

const ITEMS_PER_PAGE = 20;

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  actu:              "Toute l'actualité France et Monde en temps réel : politique, société, économie, faits divers. Analyses et décryptages quotidiens par Réalitte.",
  sport:             "Résultats, classements, transferts et analyses : football, basket, tennis, F1, rugby. Toute l'actualité sportive sur Réalitte.",
  economie:          "Marchés financiers, entreprises, emploi et conjoncture économique. Décryptages et analyses pour comprendre l'économie française et mondiale.",
  politique:         "Réformes, élections, coulisses du pouvoir : toute l'actualité politique française et internationale, décryptée sans filtre par Réalitte.",
  createurs:         "YouTube, TikTok, Twitch, podcast : l'actualité des créateurs de contenu, leurs succès, leurs projets et les tendances des réseaux sociaux.",
  people:            "Stars, royauté, cinéma, musique et télé : toute l'actualité people et célébrités en exclusivité sur Réalitte.",
  "success-stories": "Des parcours extraordinaires d'entrepreneurs, sportifs et personnalités qui ont transformé leur vie. L'inspiration au quotidien sur Réalitte.",
  "sante-beaute":    "Conseils santé, tendances beauté, bien-être et nutrition. Tout pour prendre soin de vous au quotidien sur Réalitte.",
  "fait-divers":     "Crimes, accidents, affaires judiciaires : les faits divers qui ont marqué la France, traités avec rigueur et respect par Réalitte.",
};

const SOUS_CATEGORIES: Record<string, string[]> = {
  sport:             ["Tout", "Football", "Basket", "Tennis", "F1", "Rugby"],
  economie:          ["Tout", "Finance", "Entreprises", "Marchés", "Emploi"],
  politique:         ["Tout", "France", "International", "Élections", "Social"],
  "success-stories": ["Tout", "Entrepreneuriat", "Innovation", "Persévérance", "Sport"],
  actu:              ["Tout", "France", "Monde", "Société", "Économie", "People", "Santé & Beauté", "Success Stories", "Fait Divers"],
  createurs:         ["Tout", "YouTube", "TikTok", "Streaming", "Podcast", "Réseaux Sociaux", "Tech & Créa"],
  people:            ["Tout", "Célébrités", "Royauté", "Cinéma", "Musique", "Télé"],
  "sante-beaute":    ["Tout", "Santé", "Beauté", "Bien-être", "Nutrition", "Forme"],
  "fait-divers":     ["Tout", "Crimes", "Accidents", "Justice", "Disparitions"],
};

interface PageProps {
  params: Promise<{ categorie: string }>;
  searchParams: Promise<{ sous?: string; page?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { categorie: catSlug } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const cat = await prisma.categorie.findUnique({ where: { slug: catSlug } });
  if (!cat) return { title: "Catégorie introuvable" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com";
  const canonical = currentPage === 1
    ? `${siteUrl}/${catSlug}`
    : `${siteUrl}/${catSlug}?page=${currentPage}`;
  const title = currentPage === 1
    ? `${cat.nom} — Réalitte`
    : `${cat.nom} — Page ${currentPage} — Réalitte`;
  const description = CATEGORY_DESCRIPTIONS[catSlug]
    || `Toute l'actualité ${cat.nom} sur Réalitte. Retrouvez nos derniers articles, analyses et décryptages.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: "fr_FR",
      siteName: "Réalitte",
    },
  };
}

export const revalidate = 300;

export default async function CategoriePage({ params, searchParams }: PageProps) {
  const { categorie: catSlug } = await params;
  const { sous, page: pageParam } = await searchParams;

  const currentPage = Math.max(1, Number(pageParam) || 1);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const categorie = await prisma.categorie.findUnique({ where: { slug: catSlug } });
  if (!categorie) notFound();

  const sousCatFilter = sous && sous !== "Tout" ? { sousCategorie: sous } : {};

  const [heroArticle, articles, totalCount] = await Promise.all([
    // Hero uniquement sur la page 1
    currentPage === 1
      ? prisma.article.findFirst({
          where: { statut: "PUBLISHED", categorieId: categorie.id },
          orderBy: [{ featuredCategorie: "desc" }, { datePublication: "desc" }],
          select: { id: true, titre: true, slug: true, chapo: true, imageUrl: true, imageClean: true },
        })
      : Promise.resolve(null),

    prisma.article.findMany({
      where: { statut: "PUBLISHED", categorieId: categorie.id, ...sousCatFilter },
      include: { categorie: true },
      orderBy: [{ featuredCategorie: "desc" }, { datePublication: "desc" }],
      skip,
      take: ITEMS_PER_PAGE,
    }),

    prisma.article.count({
      where: { statut: "PUBLISHED", categorieId: categorie.id, ...sousCatFilter },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const sousCats = SOUS_CATEGORIES[catSlug] || ["Tout"];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com";
  const catDescription = CATEGORY_DESCRIPTIONS[catSlug]
    || `Toute l'actualité ${categorie.nom} sur Réalitte.`;
  const canonical = currentPage === 1
    ? `${siteUrl}/${catSlug}`
    : `${siteUrl}/${catSlug}?page=${currentPage}`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${categorie.nom} — Réalitte`,
    description: catDescription,
    url: canonical,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: mappedArticles.map((a, i) => ({
        "@type": "ListItem",
        position: skip + i + 1,
        url: `${siteUrl}/${catSlug}/${a.slug}`,
        name: a.titre,
      })),
    },
  };

  function absUrl(page: number) {
    const p = new URLSearchParams();
    if (sous && sous !== "Tout") p.set("sous", sous);
    if (page > 1) p.set("page", String(page));
    const qs = p.toString();
    return `${siteUrl}/${catSlug}${qs ? `?${qs}` : ""}`;
  }
  const prevUrl = currentPage > 1 ? absUrl(currentPage - 1) : null;
  const nextUrl = currentPage < totalPages ? absUrl(currentPage + 1) : null;

  const mappedArticles: ArticleCardType[] = articles.map((a) => ({
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
    categorie: {
      nom: a.categorie.nom,
      slug: a.categorie.slug,
      couleur: a.categorie.couleur,
    },
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {/* Signaux de pagination pour les crawlers */}
      {prevUrl && <link rel="prev" href={prevUrl} />}
      {nextUrl && <link rel="next" href={nextUrl} />}

      {/* ── Hero catégorie — page 1 seulement ── */}
      {currentPage === 1 && (
        heroArticle?.imageClean ? (
          /* Image propre : image entière responsive + bouton dessous */
          <section className="bg-black">
            {heroArticle.imageUrl && (
              <Image
                src={heroArticle.imageUrl}
                alt={heroArticle.titre}
                width={0}
                height={0}
                sizes="100vw"
                priority
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            )}
            <div className="container-site py-5 flex items-center gap-4">
              <div className="inline-flex items-center px-3 py-1.5 self-start" style={{ backgroundColor: categorie.couleur }}>
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">{categorie.nom}</span>
              </div>
              <Link
                href={`/${catSlug}/${heroArticle.slug}`}
                className="inline-flex items-center px-5 py-3 bg-white text-black text-[11px] font-bold tracking-widest uppercase hover:bg-[#E53935] hover:text-white transition-colors"
              >
                Lire l&apos;article
              </Link>
            </div>
          </section>
        ) : (
          /* Hero normal : image en fond avec texte en overlay */
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
            <div className="absolute inset-0" style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.05) 100%)"
            }} />
            <div className="container-site relative z-10 flex flex-col justify-end min-h-[260px] sm:min-h-[380px] md:min-h-[460px] px-5 sm:px-8 pb-7 sm:pb-12 pt-6">
              <div className="inline-flex items-center px-3 py-1.5 mb-3 self-start" style={{ backgroundColor: categorie.couleur }}>
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">{categorie.nom}</span>
              </div>
              {heroArticle ? (
                <div className="max-w-[520px]">
                  <h1 className="text-white font-black leading-[1.05] tracking-tight mb-2 sm:mb-4" style={{ fontSize: "clamp(20px, 4vw, 44px)" }}>
                    {heroArticle.titre}
                  </h1>
                  {heroArticle.chapo && (
                    <p className="text-white/75 text-[13px] sm:text-[15px] leading-relaxed mb-4 line-clamp-2 hidden sm:block">
                      {heroArticle.chapo}
                    </p>
                  )}
                  <Link href={`/${catSlug}/${heroArticle.slug}`}
                    className="inline-flex items-center px-5 py-3 bg-white text-black text-[11px] font-bold tracking-widest uppercase hover:bg-[#E53935] hover:text-white transition-colors w-full sm:w-auto justify-center sm:justify-start">
                    Lire l&apos;article
                  </Link>
                </div>
              ) : (
                <div className="max-w-[520px]">
                  <h1 className="text-white font-black leading-tight tracking-tight mb-2" style={{ fontSize: "clamp(20px, 4vw, 44px)" }}>
                    {getHeroTitle(catSlug)}
                  </h1>
                  <p className="text-white/70 text-[14px] hidden sm:block">{getHeroSubtitle(catSlug)}</p>
                </div>
              )}
            </div>
          </section>
        )
      )}

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

            <Pagination page={currentPage} totalPages={totalPages} catSlug={catSlug} sous={sous} />
          </div>

          {/* Sidebar desktop */}
          <aside className="hidden lg:block pl-8 border-l border-[#E0E0E0]">
            <EspacePartenaire variant="sidebar" />
          </aside>
        </div>

        {/* Espace partenaire mobile */}
        <div className="lg:hidden mt-8">
          <EspacePartenaire variant="sidebar" />
        </div>

        {/* Success Stories en bas — page 1 seulement */}
        {currentPage === 1 && catSlug !== "success-stories" && (
          <SuccessStoriesSection catId={categorie.id} />
        )}
      </div>
    </>
  );
}

function Pagination({
  page,
  totalPages,
  catSlug,
  sous,
}: {
  page: number;
  totalPages: number;
  catSlug: string;
  sous?: string;
}) {
  if (totalPages <= 1) return null;

  function buildUrl(p: number) {
    const params = new URLSearchParams();
    if (sous && sous !== "Tout") params.set("sous", sous);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/${catSlug}${qs ? `?${qs}` : ""}`;
  }

  // Génère la liste des numéros à afficher avec "..." pour les ellipses
  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (i === 2 && page > 3) {
      pages.push("ellipsis-start");
    } else if (i === totalPages - 1 && page < totalPages - 2) {
      pages.push("ellipsis-end");
    }
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 mt-10 pt-8 border-t border-[#E0E0E0]">
      {page > 1 && (
        <Link
          href={buildUrl(page - 1)}
          className="px-4 py-2 text-[11px] font-bold tracking-widest uppercase border border-[#E0E0E0] hover:border-[#E53935] hover:text-[#E53935] transition-colors"
        >
          ← Précédent
        </Link>
      )}

      <div className="flex items-center gap-1 mx-2">
        {pages.map((p) =>
          typeof p === "string" ? (
            <span key={p} className="w-9 flex items-center justify-center text-[#9E9E9E] text-[13px]">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={buildUrl(p)}
              aria-current={p === page ? "page" : undefined}
              className={`w-9 h-9 flex items-center justify-center text-[12px] font-bold transition-colors ${
                p === page
                  ? "bg-[#E53935] text-white"
                  : "border border-[#E0E0E0] text-[#424242] hover:border-[#E53935] hover:text-[#E53935]"
              }`}
            >
              {p}
            </Link>
          )
        )}
      </div>

      {page < totalPages && (
        <Link
          href={buildUrl(page + 1)}
          className="px-4 py-2 text-[11px] font-bold tracking-widest uppercase border border-[#E0E0E0] hover:border-[#E53935] hover:text-[#E53935] transition-colors"
        >
          Suivant →
        </Link>
      )}
    </nav>
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
    imageClean: a.imageClean,
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
    sport:             "Votre dose quotidienne de passion et de performance.",
    economie:          "L'économie expliquée, sans langue de bois.",
    politique:         "La politique décryptée, sans filtre.",
    anecdote:          "Les histoires qui font l'humanité.",
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
    sport:             "Résultats, analyses, coulisses et enjeux : tout le sport, sans filtre.",
    economie:          "Marchés, entreprises, emploi : l'essentiel pour comprendre le monde économique.",
    politique:         "Réformes, élections, coulisses du pouvoir : l'analyse qui compte.",
    anecdote:          "Ces histoires vraies qui vous surprendront, vous toucheront, vous inspireront.",
    "success-stories": "Des parcours extraordinaires qui prouvent que tout est possible.",
    actu:              "France, monde, société : l'information vérifiée et sourcée.",
    people:            "Stars, royauté, cinéma, musique : toute l'actu de vos célébrités préférées.",
    "sante-beaute":    "Conseils santé, tendances beauté et bien-être pour prendre soin de vous.",
    "fait-divers":     "Crimes, accidents, justice : les affaires qui ont choqué la France.",
  };
  return subtitles[slug] || "Retrouvez tous nos articles sur ce sujet.";
}
