import Link from "next/link";
import ArticleCard from "@/components/article/ArticleCard";
import type { ArticleCard as ArticleCardType } from "@/types";

interface AlaUneGridProps {
  articles: ArticleCardType[];
}

export default function AlaUneGrid({ articles }: AlaUneGridProps) {
  if (articles.length === 0) return null;

  return (
    <section className="py-10 md:py-12">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-[22px] md:text-[26px] font-black tracking-tight uppercase">
          À la une
        </h2>
        <Link
          href="/actu"
          className="text-[12px] font-bold tracking-widest uppercase text-[#9E9E9E] hover:text-[#E53935] transition-colors"
        >
          Voir tout →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {articles.slice(0, 4).map((article) => (
          <ArticleCard key={article.id} article={article} variant="grid" />
        ))}
      </div>
    </section>
  );
}
