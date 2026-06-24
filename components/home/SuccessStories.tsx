import Link from "next/link";
import ArticleCard from "@/components/article/ArticleCard";
import type { ArticleCard as ArticleCardType } from "@/types";

interface SuccessStoriesProps {
  articles: ArticleCardType[];
}

export default function SuccessStories({ articles }: SuccessStoriesProps) {
  return (
    <section className="py-10 md:py-12">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-[22px] md:text-[26px] font-black tracking-tight uppercase">
          Success Stories
        </h2>
        <Link
          href="/success-stories"
          className="text-[12px] font-bold tracking-widest uppercase text-[#9E9E9E] hover:text-[#C9A84C] transition-colors"
        >
          Voir tout →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
        {articles.slice(0, 3).map((article) => (
          <ArticleCard key={article.id} article={article} variant="portrait" />
        ))}
      </div>
    </section>
  );
}
