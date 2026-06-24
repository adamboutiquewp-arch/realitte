import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import HeroSection from "@/components/home/HeroSection";
import DernieresInfos from "@/components/home/DernieresInfos";
import AlaUneGrid from "@/components/home/AlaUneGrid";
import EspacePartenaire from "@/components/home/EspacePartenaire";
import SuccessStories from "@/components/home/SuccessStories";
import Newsletter from "@/components/home/Newsletter";
import ValuesBar from "@/components/home/ValuesBar";
import NewsletterForm from "@/components/newsletter/NewsletterForm";
import Link from "next/link";
import type { ArticleCard, DerniereInfo } from "@/types";

export const metadata: Metadata = {
  title: "Réalitte — Le vrai. Le brut. Le mérité.",
  description:
    "Le média de ceux qui veulent comprendre le monde et ceux qui le changent. Actu, Sport, Économie, Politique, Anecdotes, Success Stories.",
};

export const dynamic = "force-dynamic";

async function getHomeData() {
  try {
    const [heroArticle, dernieresInfos, alaUne, successStories] =
      await Promise.all([
        prisma.article.findFirst({
          where: { statut: "PUBLISHED" },
          include: { categorie: true },
          orderBy: [{ featured: "desc" }, { datePublication: "desc" }],
        }),

        prisma.article.findMany({
          where: { statut: "PUBLISHED" },
          include: { categorie: true },
          orderBy: { datePublication: "desc" },
          take: 4,
        }),

        prisma.article.findMany({
          where: { statut: "PUBLISHED" },
          include: { categorie: true },
          orderBy: { datePublication: "desc" },
          skip: 1,
          take: 4,
        }),

        prisma.article.findMany({
          where: { statut: "PUBLISHED" },
          include: { categorie: true },
          orderBy: { datePublication: "desc" },
          skip: 5,
          take: 3,
        }),
      ]);

    return { heroArticle, dernieresInfos, alaUne, successStories };
  } catch {
    return { heroArticle: null, dernieresInfos: [], alaUne: [], successStories: [] };
  }
}

function mapToCard(a: {
  id: string;
  titre: string;
  slug: string;
  chapo: string;
  imageUrl: string | null;
  imageAlt: string | null;
  sousCategorie: string | null;
  tags: string[];
  datePublication: Date | null;
  tempsLecture: number | null;
  vues: number;
  categorie: { nom: string; slug: string; couleur: string };
}): ArticleCard {
  return {
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
  };
}

export default async function HomePage() {
  const { heroArticle, dernieresInfos, alaUne, successStories } =
    await getHomeData();

  const mappedHero: ArticleCard | null = heroArticle ? mapToCard(heroArticle) : null;

  const mappedDernieres: DerniereInfo[] = dernieresInfos.map((a) => ({
    id: a.id,
    titre: a.titre,
    slug: a.slug,
    categorieNom: a.categorie.nom,
    categorieCouleur: a.categorie.couleur,
    categorieSlug: a.categorie.slug,
    imageUrl: a.imageUrl,
    datePublication: a.datePublication,
  }));

  return (
    <>
      {/* Hero + Dernières infos */}
      <div className="bg-black">
        <div className="container-site">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0">
            <div className="lg:border-r lg:border-white/10">
              <HeroSection article={mappedHero} />
            </div>
            <div className="hidden lg:flex flex-col justify-center py-10 px-8">
              <DernieresInfos articles={mappedDernieres} dark />
            </div>
          </div>
        </div>
      </div>

      {/* Dernières infos mobile */}
      <div className="lg:hidden bg-white border-b border-[#E0E0E0] py-6">
        <div className="container-site">
          <DernieresInfos articles={mappedDernieres} />
        </div>
      </div>

      {/* Corps de page */}
      <div className="container-site">
        <AlaUneGrid articles={alaUne.map(mapToCard)} />
        <hr className="separator my-4" />
        <EspacePartenaire />
        <hr className="separator my-4" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 py-10 md:py-12">
          <SuccessStories articles={successStories.map(mapToCard)} />

          <aside className="lg:pl-8 lg:border-l lg:border-[#E0E0E0]">
            <Newsletter />
            <div className="mt-10 pt-8 border-t border-[#E0E0E0]">
              <h3 className="text-[15px] font-black tracking-tight uppercase mb-1">
                Réalitte.
              </h3>
              <div className="w-6 h-[3px] bg-[#E53935] mb-4" />
              <p className="text-[12px] font-bold tracking-widest uppercase text-[#9E9E9E] mb-3 leading-relaxed">
                Le média de ceux qui veulent comprendre le monde, et ceux qui le changent.
              </p>
              <Link
                href="/a-propos"
                className="inline-flex items-center px-5 py-3 bg-black text-white text-[11px] font-bold tracking-widest uppercase hover:bg-[#E53935] transition-colors"
              >
                Découvrir notre mission
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <NewsletterForm variant="section" />
      <ValuesBar />
    </>
  );
}
