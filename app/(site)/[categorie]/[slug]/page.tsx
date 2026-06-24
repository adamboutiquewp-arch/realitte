import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateFull, tempsLectureLabel } from "@/lib/utils";
import ArticleCard from "@/components/article/ArticleCard";
import EspacePartenaire from "@/components/home/EspacePartenaire";
import type { ArticleCard as ArticleCardType } from "@/types";

interface PageProps {
  params: Promise<{ categorie: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, categorie: catSlug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { categorie: true },
  });
  if (!article) return { title: "Article introuvable" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com";
  const articleUrl = `${siteUrl}/${catSlug}/${slug}`;
  const ogImage = article.imageUrl
    ? [{ url: article.imageUrl, alt: article.imageAlt || article.titre, width: 1200, height: 630 }]
    : [];

  return {
    title: article.metaTitle || article.titre,
    description: article.metaDescription || article.chapo,
    alternates: { canonical: articleUrl },
    openGraph: {
      title: article.metaTitle || article.titre,
      description: article.metaDescription || article.chapo,
      url: articleUrl,
      images: ogImage,
      type: "article",
      publishedTime: article.datePublication?.toISOString(),
      modifiedTime: article.dateCreation.toISOString(),
      section: article.categorie.nom,
      authors: [`${siteUrl}/a-propos`],
      locale: "fr_FR",
      siteName: "Réalitte",
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle || article.titre,
      description: article.metaDescription || article.chapo,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

export const revalidate = 600;

export default async function ArticlePage({ params }: PageProps) {
  const { slug, categorie: catSlug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug, statut: "PUBLISHED" },
    include: { categorie: true },
  });
  if (!article) notFound();

  // Incrémenter les vues de façon non-bloquante
  prisma.article
    .update({ where: { id: article.id }, data: { vues: { increment: 1 } } })
    .catch(() => {});

  // Articles liés
  const articlesLies = await prisma.article.findMany({
    where: {
      statut: "PUBLISHED",
      categorieId: article.categorieId,
      id: { not: article.id },
    },
    include: { categorie: true },
    orderBy: { datePublication: "desc" },
    take: 3,
  });

  const mappedLies: ArticleCardType[] = articlesLies.map((a) => ({
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

  // Schema.org Article JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.titre,
    description: article.chapo,
    image: article.imageUrl ? [article.imageUrl] : [],
    datePublished: article.datePublication?.toISOString(),
    dateModified: article.dateCreation.toISOString(),
    author: { "@type": "Organization", name: article.auteur },
    publisher: {
      "@type": "Organization",
      name: "Réalitte",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com"}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com"}/${catSlug}/${slug}`,
    },
  };

  return (
    <>
      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero image ── */}
      <div className="relative bg-black" style={{ height: "min(48vh, 460px)" }}>
        {article.imageUrl && (
          <Image
            src={article.imageUrl}
            alt={article.imageAlt || article.titre}
            fill
            priority
            className="object-cover object-top opacity-70"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container-site pb-5 md:pb-8">
          <Link
            href={`/${article.categorie.slug}`}
            className="inline-block mb-2 md:mb-3"
          >
            <span
              className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase px-3 py-1"
              style={{ color: "#fff", backgroundColor: article.categorie.couleur }}
            >
              {article.categorie.nom}
            </span>
          </Link>
          <h1
            className="text-white text-[22px] sm:text-3xl md:text-4xl font-black leading-tight max-w-3xl"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            {article.titre}
          </h1>
        </div>
      </div>

      {/* ── Corps ── */}
      <div className="container-site py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          {/* Article */}
          <article className="max-w-2xl">
            {/* Méta */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-[#9E9E9E] mb-6 pb-6 border-b border-[#E0E0E0]">
              {article.datePublication && (
                <span>{formatDateFull(article.datePublication)}</span>
              )}
              {article.tempsLecture && (
                <span>{tempsLectureLabel(article.tempsLecture)}</span>
              )}
              <span>{article.vues.toLocaleString("fr-FR")} vues</span>
              <span className="font-medium text-[#424242]">{article.auteur}</span>
            </div>

            {/* Chapô */}
            <p className="text-[15px] md:text-[18px] font-semibold text-[#424242] leading-relaxed mb-6 md:mb-8 italic">
              {article.chapo}
            </p>

            {/* Contenu */}
            <div
              className="prose-realitte"
              dangerouslySetInnerHTML={{ __html: article.contenu }}
            />

            {/* Source */}
            <div className="mt-10 pt-6 border-t border-[#E0E0E0]">
              <p className="text-[12px] text-[#9E9E9E]">
                Source :{" "}
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#111111] underline hover:text-[#E53935] transition-colors"
                >
                  {article.sourceNom}
                </a>
              </p>
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 border border-[#E0E0E0] text-[11px] font-medium text-[#424242] tracking-wide"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Partage */}
            <div className="mt-8 pt-6 border-t border-[#E0E0E0]">
              <p className="text-[12px] font-bold tracking-widest uppercase text-[#9E9E9E] mb-3">
                Partager
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <ShareButton
                  href={`https://x.com/intent/tweet?text=${encodeURIComponent(article.titre)}&url=${process.env.NEXT_PUBLIC_SITE_URL}/${catSlug}/${slug}`}
                  label="X (Twitter)"
                />
                <ShareButton
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${process.env.NEXT_PUBLIC_SITE_URL}/${catSlug}/${slug}&title=${encodeURIComponent(article.titre)}`}
                  label="LinkedIn"
                />
                <ShareButton
                  href={`https://www.facebook.com/sharer/sharer.php?u=${process.env.NEXT_PUBLIC_SITE_URL}/${catSlug}/${slug}`}
                  label="Facebook"
                />
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <EspacePartenaire />
            </div>
          </aside>
        </div>

        {/* Articles liés */}
        {mappedLies.length > 0 && (
          <section className="mt-14 pt-8 border-t border-[#E0E0E0]">
            <h2 className="text-[20px] font-black tracking-tight uppercase mb-8">
              À lire aussi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
              {mappedLies.map((a) => (
                <ArticleCard key={a.id} article={a} variant="grid" showDate />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function ShareButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center sm:inline-flex px-4 py-3 sm:py-2.5 min-h-[44px] border border-[#E0E0E0] text-[12px] font-bold tracking-wider uppercase text-[#424242] hover:border-black hover:text-black transition-colors"
    >
      {label}
    </a>
  );
}
