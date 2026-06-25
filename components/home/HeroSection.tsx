import Image from "next/image";
import Link from "next/link";
import type { ArticleCard } from "@/types";

interface HeroSectionProps {
  article: ArticleCard | null;
}

export default function HeroSection({ article }: HeroSectionProps) {
  if (!article) return <HeroPlaceholder />;

  const href = `/${article.categorie.slug}/${article.slug}`;

  if (article.imageClean) {
    /* ── Mode image propre : image entière responsive + bouton dessous ── */
    return (
      <section className="bg-black">
        {article.imageUrl && (
          <Image
            src={article.imageUrl}
            alt={article.imageAlt || article.titre}
            width={0}
            height={0}
            sizes="100vw"
            priority
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        )}
        <div className="px-5 sm:px-8 md:px-10 py-5 sm:py-7">
          <Link
            href={href}
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3.5 bg-white text-black text-[12px] font-bold tracking-widest uppercase hover:bg-[#E53935] hover:text-white transition-colors duration-200"
          >
            Lire l&apos;article
          </Link>
        </div>
      </section>
    );
  }

  /* ── Mode normal : hero avec texte en overlay ── */
  return (
    <section className="relative bg-black overflow-hidden min-h-[300px] sm:min-h-[460px] md:min-h-[540px]">
      {article.imageUrl && (
        <div className="absolute inset-0">
          <Image
            src={article.imageUrl}
            alt={article.imageAlt || article.titre}
            fill
            priority
            className="object-cover object-top opacity-90"
            sizes="100vw"
          />
        </div>
      )}
      <div className="absolute inset-0 hero-overlay" />
      <div className="relative z-10 flex flex-col justify-end min-h-[300px] sm:min-h-[460px] md:min-h-[540px] px-5 sm:px-8 md:px-10 py-7 sm:py-12 md:py-16">
        <div className="w-full max-w-[460px]">
          <div className="inline-flex items-center px-3 py-1.5 bg-[#C9A84C] mb-3 sm:mb-5">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-black">
              À la une
            </span>
          </div>
          <h1
            className="text-white font-black leading-[1.05] tracking-tight mb-3 sm:mb-5"
            style={{ fontSize: "clamp(24px, 5vw, 52px)" }}
          >
            {article.titre}
          </h1>
          <p className="text-white/70 text-[13px] sm:text-[15px] leading-relaxed mb-4 sm:mb-8 line-clamp-2">
            {article.chapo}
          </p>
          <Link
            href={href}
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3.5 bg-white text-black text-[12px] font-bold tracking-widest uppercase hover:bg-[#E53935] hover:text-white transition-colors duration-200"
          >
            Lire l&apos;article
          </Link>
        </div>
      </div>
    </section>
  );
}

function HeroPlaceholder() {
  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden min-h-[300px] sm:min-h-[460px] md:min-h-[540px]">
      <div className="absolute inset-0 hero-overlay" />

      <div className="relative z-10 flex flex-col justify-end min-h-[300px] sm:min-h-[460px] md:min-h-[540px] px-5 sm:px-8 md:px-10 py-7 sm:py-12 md:py-16">
        <div className="max-w-[460px]">
          <div className="inline-flex items-center px-3 py-1.5 bg-[#C9A84C] mb-3 sm:mb-5">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-black">
              À la une
            </span>
          </div>

          <h1
            className="text-white font-black leading-[1.0] tracking-tight mb-3 sm:mb-5"
            style={{ fontSize: "clamp(26px, 5.5vw, 58px)" }}
          >
            DISCIPLINE.<br />
            TRAVAIL.<br />
            <span className="text-[#C9A84C]">RÉALITTE.</span>
          </h1>

          <p className="text-white/65 text-[13px] sm:text-[15px] leading-relaxed mb-4 sm:mb-8">
            Dans les coulisses de ceux qui réussissent sans tricher.
          </p>
        </div>
      </div>
    </section>
  );
}
