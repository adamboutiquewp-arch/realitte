import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ArticleEditor from "./ArticleEditor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id }, select: { titre: true } });
  return { title: article ? `Éditer — ${article.titre.slice(0, 40)}` : "Article introuvable" };
}

export const dynamic = "force-dynamic";

export default async function AdminArticleEditPage({ params }: PageProps) {
  const { id } = await params;

  const [article, categories] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: { categorie: true },
    }),
    prisma.categorie.findMany({ orderBy: { ordre: "asc" } }),
  ]);

  if (!article) notFound();

  return (
    <ArticleEditor
      article={{
        ...article,
        dateCreation: article.dateCreation.toISOString(),
        datePublication: article.datePublication?.toISOString() || null,
      }}
      categories={categories}
    />
  );
}
