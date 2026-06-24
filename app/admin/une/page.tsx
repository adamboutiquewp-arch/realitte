import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import UneGestionCard from "@/components/admin/UneGestionCard";
import Link from "next/link";

export const metadata: Metadata = { title: "Gestion des unes" };
export const dynamic = "force-dynamic";

export default async function UnePage() {
  const categories = await prisma.categorie.findMany({
    orderBy: { ordre: "asc" },
  });

  // Pour chaque catégorie : article en une + liste des publiés pour picker
  const data = await Promise.all(
    categories.map(async (cat) => {
      const [uneArticle, articles] = await Promise.all([
        prisma.article.findFirst({
          where: { categorieId: cat.id, statut: "PUBLISHED", featuredCategorie: true },
          select: { id: true, titre: true, chapo: true, imageUrl: true, slug: true },
        }),
        prisma.article.findMany({
          where: { categorieId: cat.id, statut: "PUBLISHED" },
          select: { id: true, titre: true, chapo: true, imageUrl: true, slug: true, featuredCategorie: true },
          orderBy: { datePublication: "desc" },
          take: 15,
        }),
      ]);
      return { categorie: cat, uneArticle, articles };
    })
  );

  // Une globale (page d'accueil)
  const uneGlobale = await prisma.article.findFirst({
    where: { statut: "PUBLISHED", featured: true },
    select: { id: true, titre: true, chapo: true, imageUrl: true, slug: true },
  });

  const allPublished = await prisma.article.findMany({
    where: { statut: "PUBLISHED" },
    select: { id: true, titre: true, featured: true, imageUrl: true, chapo: true, slug: true, categorie: { select: { nom: true, couleur: true } } },
    orderBy: { datePublication: "desc" },
    take: 30,
  });

  return (
    <div className="max-w-[1100px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-black text-[#111]">Gestion des unes</h1>
          <p className="text-[13px] text-[#999] mt-0.5">
            Sélectionne l&apos;article affiché en tête de chaque rubrique
          </p>
        </div>
        <Link
          href="/admin/articles"
          className="text-[12px] text-[#bbb] hover:text-[#111] transition-colors"
        >
          ← Voir tous les articles
        </Link>
      </div>

      {/* Une globale */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#999]">Une globale</span>
          <span className="w-4 h-px bg-[#E8E8E8]" />
          <span className="text-[11px] text-[#bbb]">Affiché en grand sur la page d&apos;accueil</span>
        </div>
        <UneGestionCard
          type="global"
          couleur="#E53935"
          nomCategorie="Page d'accueil"
          uneArticle={uneGlobale ? {
            id: uneGlobale.id,
            titre: uneGlobale.titre,
            imageUrl: uneGlobale.imageUrl,
            chapo: uneGlobale.chapo || "",
            slug: uneGlobale.slug,
            featuredCategorie: true,
          } : null}
          articles={allPublished.map((a) => ({
            id: a.id,
            titre: a.titre,
            imageUrl: a.imageUrl,
            chapo: a.chapo,
            slug: a.slug,
            featuredCategorie: a.featured,
          }))}
          categorieId={null}
        />
      </div>

      {/* Séparateur */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[11px] font-bold tracking-wider uppercase text-[#999]">Unes par rubrique</span>
        <div className="flex-1 h-px bg-[#F0F0F0]" />
      </div>

      {/* Grille par catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {data.map(({ categorie, uneArticle, articles }) => (
          <UneGestionCard
            key={categorie.id}
            type="categorie"
            couleur={categorie.couleur}
            nomCategorie={categorie.nom}
            categorieId={categorie.id}
            uneArticle={uneArticle}
            articles={articles}
          />
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-16 text-[#bbb] text-[14px]">
          Aucune catégorie trouvée. <Link href="/admin/categories" className="text-[#E53935] underline">Créer des catégories</Link>
        </div>
      )}
    </div>
  );
}
