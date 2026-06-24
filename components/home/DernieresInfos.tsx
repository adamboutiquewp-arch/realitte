import Link from "next/link";
import Image from "next/image";
import type { DerniereInfo } from "@/types";
import { formatHeure } from "@/lib/utils";

interface DernieresInfosProps {
  articles: DerniereInfo[];
  withImages?: boolean;
}

export default function DernieresInfos({ articles, withImages = false }: DernieresInfosProps) {
  return (
    <aside className="bg-white">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-black">
        <h2 className="text-[15px] font-black tracking-wider uppercase">
          Dernières infos
        </h2>
      </div>

      <ul className="space-y-0 divide-y divide-[#F0F0F0]">
        {articles.map((article) => (
          <li key={article.id}>
            <Link
              href={`/${article.categorieSlug || "actu"}/${article.slug}`}
              className="flex items-start gap-3 py-3.5 group"
            >
              {/* Heure */}
              <span className="flex-shrink-0 text-[13px] font-bold text-[#9E9E9E] w-10 pt-0.5">
                {article.datePublication ? formatHeure(article.datePublication) : "--:--"}
              </span>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <span
                  className="block text-[11px] font-bold tracking-widest uppercase mb-1"
                  style={{ color: article.categorieCouleur }}
                >
                  {article.categorieNom}
                </span>
                <p className="text-[13px] font-semibold text-[#111111] leading-snug group-hover:text-[#E53935] transition-colors line-clamp-2">
                  {article.titre}
                </p>
              </div>

              {/* Vignette (tablette+) */}
              {withImages && article.imageUrl && (
                <div className="flex-shrink-0 w-16 h-12 relative overflow-hidden hidden md:block">
                  <Image
                    src={article.imageUrl}
                    alt={article.titre}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/actu"
        className="inline-flex items-center gap-1 mt-4 text-[12px] font-bold tracking-widest uppercase text-[#9E9E9E] hover:text-[#E53935] transition-colors"
      >
        Voir toutes les infos →
      </Link>
    </aside>
  );
}
