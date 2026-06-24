import Link from "next/link";
import ArticleCard from "@/components/article/ArticleCard";
import type { ArticleCard as ArticleCardType } from "@/types";

interface SuccessStoriesProps {
  articles: ArticleCardType[];
}

export default function SuccessStories({ articles }: SuccessStoriesProps) {
  return (
    <section className="py-6 md:py-12">
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <h2 className="text-[20px] md:text-[26px] font-black tracking-tight uppercase">
          Success Stories
        </h2>
        <Link
          href="/success-stories"
          className="text-[12px] font-bold tracking-widest uppercase text-[#9E9E9E] hover:text-[#C9A84C] transition-colors"
        >
          Voir tout →
        </Link>
      </div>

      {/* Mobile : liste horizontale scrollable */}
      <div className="flex gap-4 overflow-x-auto pb-2 sm:hidden snap-x snap-mandatory scrollbar-hide">
        {articles.slice(0, 3).map((article) => (
          <div key={article.id} className="snap-start flex-shrink-0 w-[72vw]">
            <ArticleCard article={article} variant="grid" />
          </div>
        ))}
      </div>

      {/* Desktop : grille 3 colonnes */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-6 md:gap-8">
        {articles.slice(0, 3).map((article) => (
          <ArticleCard key={article.id} article={article} variant="portrait" />
        ))}
      </div>
    </section>
  );
}
