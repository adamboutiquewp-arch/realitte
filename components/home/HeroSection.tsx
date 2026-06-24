import Image from "next/image";
import Link from "next/link";
import type { ArticleCard } from "@/types";

interface HeroSectionProps {
  article: ArticleCard | null;
}

export default function HeroSection({ article }: HeroSectionProps) {
  if (!article) return <HeroPlaceholder />;

  const href = `/${article.categorie.slug}/${article.slug}`;

  return (
    <section className="relative bg-black overflow-hidden" style={{ minHeight: 420 }}>
      {/* Image de fond */}
      {article.imageUrl && (
        <div className="absolute inset-0">
          <Image
            src={article.imageUrl}
            alt={article.imageAlt || article.titre}
            fill
            priority
            className="object-cover object-center opacity-50"
            sizes="100vw"
          />
        </div>
      )}

      {/* Gradient */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Contenu */}
      <div className="container-site relative z-10 py-16 md:py-20 flex flex-col justify-end min-h-[420px] md:min-h-[500px]">
        <div className="max-w-lg">
          {/* Tag À LA UNE */}
          <div className="inline-flex items-center px-3 py-1.5 bg-[#C9A84C] mb-5">
            <span className="text-[11px] font-bold tracking-widest uppercase text-black">
              À la une
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-white text-4xl md:text-5xl font-black leading-[1.05] tracking-tight mb-4">
            {article.titre}
          </h1>

          {/* Chapô */}
          <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 line-clamp-2">
            {article.chapo}
          </p>

          {/* CTA */}
          <Link
            href={href}
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-white text-black text-[13px] font-bold tracking-widest uppercase hover:bg-[#E53935] hover:text-white transition-colors duration-200"
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
    <section className="bg-black" style={{ minHeight: 500 }}>
      <div className="container-site py-20 flex flex-col justify-end min-h-[500px]">
        <div className="max-w-lg">
          <div className="inline-flex items-center px-3 py-1.5 bg-[#C9A84C] mb-5">
            <span className="text-[11px] font-bold tracking-widest uppercase text-black">À la une</span>
          </div>
          <h1 className="text-white text-5xl font-black leading-tight mb-6">
            DISCIPLINE.<br />TRAVAIL.<br />
            <span className="text-[#C9A84C]">RÉALITTE.</span>
          </h1>
          <p className="text-white/70 text-lg mb-8">
            Dans les coulisses de ceux qui réussissent sans tricher.
          </p>
          <span className="inline-flex items-center gap-3 px-8 py-3.5 border-2 border-white text-white text-[13px] font-bold tracking-widest uppercase">
            Lire l&apos;article
          </span>
        </div>
      </div>
    </section>
  );
}
