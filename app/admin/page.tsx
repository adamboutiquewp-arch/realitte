import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Tableau de bord" };

export const dynamic = "force-dynamic";

async function getStats() {
  const [
    totalPublies,
    totalPending,
    totalDraft,
    totalRejetes,
    totalVues,
    totalAbonnes,
    topArticles,
    dernieresPending,
    totalAvisPending,
  ] = await Promise.all([
    prisma.article.count({ where: { statut: "PUBLISHED" } }),
    prisma.article.count({ where: { statut: "PENDING" } }),
    prisma.article.count({ where: { statut: "DRAFT" } }),
    prisma.article.count({ where: { statut: "REJECTED" } }),
    prisma.article.aggregate({ _sum: { vues: true } }),
    prisma.abonneNewsletter.count({ where: { actif: true } }),
    prisma.article.findMany({
      where: { statut: "PUBLISHED" },
      orderBy: { vues: "desc" },
      take: 5,
      include: { categorie: { select: { nom: true, couleur: true } } },
    }),
    prisma.article.findMany({
      where: { statut: "PENDING" },
      orderBy: { dateCreation: "desc" },
      take: 5,
      include: { categorie: { select: { nom: true, couleur: true } } },
    }),
    prisma.avis.count({ where: { statut: "PENDING" } }),
  ]);

  return {
    totalPublies,
    totalPending,
    totalDraft,
    totalRejetes,
    vuesTotal: totalVues._sum.vues || 0,
    totalAbonnes,
    topArticles,
    dernieresPending,
    totalAvisPending,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-2xl font-black text-[#111111] mb-1">Tableau de bord</h1>
      <p className="text-[13px] text-[#9E9E9E] mb-8">Vue d&apos;ensemble de Réalitte</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Articles publiés" value={stats.totalPublies} color="#111111" href="/admin/articles?statut=PUBLISHED" />
        <KpiCard label="En attente" value={stats.totalPending} color="#E53935" href="/admin/articles?statut=PENDING" />
        <KpiCard label="Abonnés newsletter" value={stats.totalAbonnes} color="#1565C0" href="/admin/newsletter" />
        <KpiCard label="Vues totales" value={stats.vuesTotal.toLocaleString("fr-FR")} color="#C9A84C" />
      </div>

      {/* Ligne 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Articles en attente */}
        <div className="bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-[15px] uppercase tracking-tight">
              En attente de validation
            </h2>
            <Link
              href="/admin/articles?statut=PENDING"
              className="text-[11px] font-bold tracking-widest uppercase text-[#9E9E9E] hover:text-[#E53935]"
            >
              Voir tout →
            </Link>
          </div>

          {stats.dernieresPending.length === 0 ? (
            <p className="text-[#9E9E9E] text-sm py-4">Aucun article en attente.</p>
          ) : (
            <ul className="divide-y divide-[#F5F5F5]">
              {stats.dernieresPending.map((a) => (
                <li key={a.id} className="py-3 flex items-start gap-3">
                  <span
                    className="flex-shrink-0 text-[10px] font-bold tracking-widest uppercase mt-0.5 pt-0.5 px-1.5 py-0.5"
                    style={{ color: a.categorie.couleur, border: `1px solid ${a.categorie.couleur}` }}
                  >
                    {a.categorie.nom}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/articles/${a.id}`}
                      className="block text-[13px] font-semibold text-[#111111] hover:text-[#E53935] transition-colors line-clamp-1"
                    >
                      {a.titre}
                    </Link>
                    <span className="text-[11px] text-[#9E9E9E]">
                      {formatDate(a.dateCreation)}
                    </span>
                  </div>
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="flex-shrink-0 px-3 py-1.5 bg-black text-white text-[11px] font-bold tracking-wider uppercase hover:bg-[#E53935] transition-colors"
                  >
                    Réviser
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top articles */}
        <div className="bg-white p-6">
          <h2 className="font-black text-[15px] uppercase tracking-tight mb-5">
            Top articles (vues)
          </h2>
          {stats.topArticles.length === 0 ? (
            <p className="text-[#9E9E9E] text-sm py-4">Aucun article publié.</p>
          ) : (
            <ul className="space-y-3">
              {stats.topArticles.map((a, i) => (
                <li key={a.id} className="flex items-center gap-4">
                  <span className="text-[20px] font-black text-[#E0E0E0] w-7 flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#111111] line-clamp-1">
                      {a.titre}
                    </p>
                    <span
                      className="text-[10px] font-bold tracking-widest uppercase"
                      style={{ color: a.categorie.couleur }}
                    >
                      {a.categorie.nom}
                    </span>
                  </div>
                  <span className="flex-shrink-0 text-[13px] font-bold text-[#424242]">
                    {a.vues.toLocaleString("fr-FR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Alertes */}
      {stats.totalAvisPending > 0 && (
        <div className="mt-6 bg-[#FFF3CD] border border-[#FFD700]/30 p-4 flex items-center justify-between">
          <p className="text-[13px] font-medium text-[#856404]">
            {stats.totalAvisPending} commentaire{stats.totalAvisPending > 1 ? "s" : ""} en attente de modération
          </p>
          <Link
            href="/admin/commentaires"
            className="text-[12px] font-bold tracking-widest uppercase text-[#856404] hover:underline"
          >
            Modérer →
          </Link>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  color,
  href,
}: {
  label: string;
  value: number | string;
  color: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white p-5 h-full">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-bold tracking-widest uppercase text-[#9E9E9E]">
          {label}
        </p>
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      </div>
      <p className="text-3xl font-black" style={{ color }}>
        {value}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:shadow-md transition-shadow">
        {content}
      </Link>
    );
  }
  return <div>{content}</div>;
}
