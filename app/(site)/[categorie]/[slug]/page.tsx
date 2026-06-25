import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateFull, tempsLectureLabel } from "@/lib/utils";
import ArticleCard from "@/components/article/ArticleCard";
import EspacePartenaire from "@/components/home/EspacePartenaire";
import ShareButtons from "@/components/article/ShareButtons";
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

  // Articles liés — par tags d'abord, sinon par catégorie
  let articlesLies = article.tags.length > 0
    ? await prisma.article.findMany({
        where: {
          statut: "PUBLISHED",
          id: { not: article.id },
          tags: { hasSome: article.tags },
        },
        include: { categorie: true },
        orderBy: { datePublication: "desc" },
        take: 3,
      })
    : [];

  if (articlesLies.length < 3) {
    const ids = [article.id, ...articlesLies.map((a) => a.id)];
    const complement = await prisma.article.findMany({
      where: { statut: "PUBLISHED", categorieId: article.categorieId, id: { notIn: ids } },
      include: { categorie: true },
      orderBy: { datePublication: "desc" },
      take: 3 - articlesLies.length,
    });
    articlesLies = [...articlesLies, ...complement];
  }

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

      {/* ── Hero article ── */}
      {article.imageClean ? (
        /* Image propre : image complète + titre DESSOUS */
        <>
          {article.imageUrl && (
            <div className="w-full bg-black">
              <Image
                src={article.imageUrl}
                alt={article.imageAlt || article.titre}
                width={1200}
                height={460}
                priority
                className="w-full h-auto block"
                sizes="100vw"
              />
            </div>
          )}
          <div className="bg-[#111] text-white">
            <div className="container-site py-5 md:py-7">
              <Link href={`/${article.categorie.slug}`} className="inline-block mb-2 md:mb-3">
                <span className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase px-3 py-1"
                  style={{ backgroundColor: article.categorie.couleur, color: "#fff" }}>
                  {article.categorie.nom}
                </span>
              </Link>
              <h1 className="text-white text-[22px] sm:text-3xl md:text-4xl font-black leading-tight max-w-3xl"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                {article.titre}
              </h1>
            </div>
          </div>
        </>
      ) : (
        /* Image normale : titre en overlay sur l'image */
        <div className="relative bg-black" style={{ height: "min(48vh, 460px)" }}>
          {article.imageUrl && (
            <Image
              src={article.imageUrl}
              alt={article.imageAlt || article.titre}
              fill
              priority
              className="object-cover opacity-70"
              style={{ objectPosition: "center 20%" }}
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container-site pb-5 md:pb-8">
            <Link href={`/${article.categorie.slug}`} className="inline-block mb-2 md:mb-3">
              <span className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase px-3 py-1"
                style={{ color: "#fff", backgroundColor: article.categorie.couleur }}>
                {article.categorie.nom}
              </span>
            </Link>
            <h1 className="text-white text-[22px] sm:text-3xl md:text-4xl font-black leading-tight max-w-3xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              {article.titre}
            </h1>
          </div>
        </div>
      )}

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
                  <Link
                    key={tag}
                    href={`/tag/${encodeURIComponent(tag)}`}
                    className="px-3 py-1 border border-[#E0E0E0] text-[11px] font-medium text-[#424242] tracking-wide hover:border-[#E53935] hover:text-[#E53935] transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <ShareButtons
              url={`${process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com"}/${catSlug}/${slug}`}
              titre={article.titre}
            />
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <EspacePartenaire />
              {articlesLies.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#E53935] mb-4">
                    Sur le même sujet
                  </h3>
                  <ul className="space-y-4">
                    {articlesLies.map((a) => (
                      <li key={a.id} className="border-b border-[#F0F0F0] pb-4 last:border-0">
                        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: a.categorie.couleur }}>
                          {a.categorie.nom}
                        </span>
                        <Link
                          href={`/${a.categorie.slug}/${a.slug}`}
                          className="block text-[13px] font-semibold text-[#111] hover:text-[#E53935] transition-colors leading-snug mt-1"
                        >
                          {a.titre}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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

