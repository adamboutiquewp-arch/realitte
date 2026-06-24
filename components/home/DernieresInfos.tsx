import Link from "next/link";
import Image from "next/image";
import type { DerniereInfo } from "@/types";
import { formatHeure } from "@/lib/utils";

interface DernieresInfosProps {
  articles: DerniereInfo[];
  withImages?: boolean;
  dark?: boolean;
}

export default function DernieresInfos({
  articles,
  withImages = false,
  dark = false,
}: DernieresInfosProps) {
  return (
    <aside>
      <div
        className={`flex items-center gap-3 mb-5 pb-4 border-b-2 ${
          dark ? "border-[#C9A84C]" : "border-black"
        }`}
      >
        <h2
          className={`text-[13px] font-black tracking-[0.18em] uppercase ${
            dark ? "text-white" : "text-[#111111]"
          }`}
        >
          Dernières infos
        </h2>
      </div>

      <ul
        className={`divide-y ${dark ? "divide-[#2a2a2a]" : "divide-[#F0F0F0]"}`}
      >
        {articles.map((article) => (
          <li key={article.id}>
            <Link
              href={`/${article.categorieSlug || "actu"}/${article.slug}`}
              className="flex items-start gap-3 py-4 group"
            >
              <span
                className={`flex-shrink-0 text-[12px] font-bold w-10 pt-0.5 ${
                  dark ? "text-[#666666]" : "text-[#9E9E9E]"
                }`}
              >
                {article.datePublication
                  ? formatHeure(article.datePublication)
                  : "--:--"}
              </span>

              <div className="flex-1 min-w-0">
                <span
                  className="block text-[10px] font-bold tracking-widest uppercase mb-1"
                  style={{ color: article.categorieCouleur }}
                >
                  {article.categorieNom}
                </span>
                <p
                  className={`text-[13px] font-semibold leading-snug group-hover:text-[#E53935] transition-colors line-clamp-2 ${
                    dark ? "text-white" : "text-[#111111]"
                  }`}
                >
                  {article.titre}
                </p>
              </div>

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
        className={`inline-flex items-center gap-1 mt-5 text-[11px] font-bold tracking-widest uppercase transition-colors ${
          dark
            ? "text-[#555555] hover:text-[#C9A84C]"
            : "text-[#9E9E9E] hover:text-[#E53935]"
        }`}
      >
        Voir toutes les infos →
      </Link>
    </aside>
  );
}
