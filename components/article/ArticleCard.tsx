import Link from "next/link";
import Image from "next/image";
import type { ArticleCard as ArticleCardType } from "@/types";
import { formatDate } from "@/lib/utils";

interface ArticleCardProps {
  article: ArticleCardType;
  variant?: "grid" | "list" | "portrait" | "featured";
  showDate?: boolean;
}

export default function ArticleCard({
  article,
  variant = "grid",
  showDate = false,
}: ArticleCardProps) {
  const href = `/${article.categorie.slug}/${article.slug}`;
  const { nom: catNom, slug: catSlug, couleur: catCouleur } = article.categorie;

  if (variant === "list") {
    return (
      <article className="flex items-start gap-4 py-5 group">
        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <Link href={`/${catSlug}`}>
            <span
              className="block text-[11px] font-bold tracking-widest uppercase mb-2"
              style={{ color: catCouleur }}
            >
              {article.sousCategorie || catNom}
            </span>
          </Link>
          <Link href={href}>
            <h3 className="font-bold text-[16px] md:text-[18px] leading-snug text-[#111111] group-hover:text-[#E53935] transition-colors mb-2">
              {article.titre}
            </h3>
            <p className="text-[14px] text-[#424242] leading-relaxed line-clamp-2 mb-3">
              {article.chapo}
            </p>
          </Link>
          <Link href={href} className="read-link">
            Lire l&apos;article
          </Link>
        </div>

        {/* Image */}
        {article.imageUrl && (
          <Link href={href} className="flex-shrink-0 w-28 md:w-36 h-20 md:h-24 relative overflow-hidden block">
            <Image
              src={article.imageUrl}
              alt={article.imageAlt || article.titre}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 112px, 144px"
            />
          </Link>
        )}
      </article>
    );
  }

  if (variant === "portrait") {
    return (
      <article className="group">
        <Link href={href} className="block">
          {/* Image */}
          <div className="relative overflow-hidden aspect-[3/4] mb-4">
            {article.imageUrl ? (
              <Image
                src={article.imageUrl}
                alt={article.imageAlt || article.titre}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-[#1a1a1a]" />
            )}
          </div>

          {/* Méta */}
          <span
            className="block text-[11px] font-bold tracking-widest uppercase mb-2"
            style={{ color: catCouleur }}
          >
            {article.sousCategorie || catNom}
          </span>
          <h3 className="font-bold text-[16px] leading-snug text-[#111111] group-hover:text-[#E53935] transition-colors mb-3">
            {article.titre}
          </h3>
          <span className="read-link">Lire l&apos;article</span>
        </Link>
      </article>
    );
  }

  /* variant === "grid" (défaut) */
  return (
    <article className="group flex flex-col">
      {/* Image */}
      <Link href={href} className="block relative overflow-hidden aspect-video mb-4">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.imageAlt || article.titre}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-[#F5F5F5]" />
        )}
      </Link>

      {/* Méta */}
      <div className="flex-1 flex flex-col">
        <Link href={`/${catSlug}`}>
          <span
            className="block text-[11px] font-bold tracking-widest uppercase mb-2"
            style={{ color: catCouleur }}
          >
            {catNom}
          </span>
        </Link>
        <Link href={href}>
          <h3 className="font-bold text-[16px] md:text-[18px] leading-snug text-[#111111] group-hover:text-[#E53935] transition-colors mb-2 line-clamp-3">
            {article.titre}
          </h3>
          <p className="text-[13px] text-[#424242] leading-relaxed line-clamp-2 mb-4 flex-1">
            {article.chapo}
          </p>
        </Link>
        <div className="flex items-center justify-between mt-auto">
          <Link href={href} className="read-link">
            Lire l&apos;article
          </Link>
          {showDate && article.datePublication && (
            <span className="text-[11px] text-[#9E9E9E]">
              {formatDate(article.datePublication)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
