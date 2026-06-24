import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/article/ArticleCard";
import type { ArticleCard as ArticleCardType } from "@/types";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const nom = decodeURIComponent(tag);
  return {
    title: `#${nom} — Réalitte`,
    description: `Tous les articles Réalitte sur le sujet "${nom}". Actu, analyses et décryptages.`,
    alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com"}/tag/${tag}` },
    openGraph: {
      title: `#${nom} — Réalitte`,
      description: `Tous les articles sur "${nom}".`,
      type: "website",
    },
  };
}

export const revalidate = 300;

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const nom = decodeURIComponent(tag);

  const articles = await prisma.article.findMany({
    where: {
      statut: "PUBLISHED",
      tags: { has: nom },
    },
    include: { categorie: true },
    orderBy: { datePublication: "desc" },
    take: 50,
  });

  if (articles.length === 0) notFound();

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
    <div className="container-site py-10 md:py-14">
      {/* En-tête */}
      <div className="mb-8 pb-6 border-b border-[#E0E0E0]">
        <Link
          href="/"
          className="text-[11px] font-bold tracking-widest uppercase text-[#9E9E9E] hover:text-[#E53935] transition-colors mb-4 inline-block"
        >
          ← Accueil
        </Link>
        <div className="flex items-baseline gap-3">
          <span className="text-[#E53935] text-[28px] font-black">#</span>
          <h1 className="text-[26px] md:text-[34px] font-black tracking-tight text-[#111]">
            {nom}
          </h1>
        </div>
        <p className="text-[13px] text-[#9E9E9E] mt-2">
          {articles.length} article{articles.length > 1 ? "s" : ""} sur ce sujet
        </p>
      </div>

      {/* Grille articles */}
      <ul className="divide-y divide-[#E0E0E0]">
        {mapped.map((article) => (
          <li key={article.id}>
            <ArticleCard article={article} variant="list" showDate />
          </li>
        ))}
      </ul>
    </div>
  );
}
