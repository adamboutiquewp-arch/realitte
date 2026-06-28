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
    vuesAgg,
    totalAbonnes,
    topArticles,
    dernieresPending,
    totalAvisPending,
  ] = await Promise.all([
    prisma.article.count({ where: { statut: "PUBLISHED" } }),
    prisma.article.count({ where: { statut: "PENDING" } }),
    prisma.article.count({ where: { statut: "DRAFT" } }),
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

  // File d'attente — table peut ne pas encore exister (avant déploiement)
  let articlesEnFile: { id: string; titre: string; scheduledFor: Date | null; categorie: { nom: string; couleur: string } }[] = [];
  let socialEnFile: { id: string; network: string; scheduledAt: Date; article: { titre: string } }[] = [];
  try {
    [articlesEnFile, socialEnFile] = await Promise.all([
      prisma.article.findMany({
        where: { statut: "PENDING", scheduledFor: { not: null } },
        select: { id: true, titre: true, scheduledFor: true, categorie: { select: { nom: true, couleur: true } } },
        orderBy: { scheduledFor: "asc" },
        take: 5,
      }),
      prisma.socialQueueItem.findMany({
        where: { statut: "PENDING" },
        select: { id: true, network: true, scheduledAt: true, article: { select: { titre: true } } },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      }),
    ]);
  } catch { /* DB pas encore à jour */ }

  return {
    totalPublies,
    totalPending,
    totalDraft,
    vuesTotal: vuesAgg._sum.vues || 0,
    totalAbonnes,
    topArticles,
    dernieresPending,
    totalAvisPending,
    articlesEnFile,
    socialEnFile,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="max-w-[1100px]">
      {/* ── Bannière À valider ── */}
      {stats.totalPending > 0 && (
        <Link
          href="/admin/articles?statut=PENDING"
          className="flex items-center justify-between gap-4 px-5 py-4 bg-[#E53935] text-white rounded-xl mb-6 hover:bg-[#c62828] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-black">
                {stats.totalPending} article{stats.totalPending > 1 ? "s" : ""} en attente de validation
              </p>
              <p className="text-[12px] text-white/70">
                Clique ici pour les réviser et les publier sur le site
              </p>
            </div>
          </div>
          <span className="text-white/80 text-[18px] group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      )}

      {/* En-tête */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-black text-[#111]">Tableau de bord</h1>
          <p className="text-[13px] text-[#999] mt-0.5">Vue d&apos;ensemble de Réalitte</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          icon={<IconPublished />}
          label="Articles publiés"
          value={stats.totalPublies}
          sub={`${stats.totalDraft} brouillon${stats.totalDraft !== 1 ? "s" : ""}`}
          accent="#111111"
          href="/admin/articles?statut=PUBLISHED"
        />
        <KpiCard
          icon={<IconClock />}
          label="En attente"
          value={stats.totalPending}
          sub="à valider"
          accent="#E53935"
          href="/admin/articles?statut=PENDING"
          urgent={stats.totalPending > 0}
        />
        <KpiCard
          icon={<IconMail />}
          label="Abonnés"
          value={stats.totalAbonnes}
          sub="newsletter actifs"
          accent="#3B82F6"
          href="/admin/newsletter"
        />
        <KpiCard
          icon={<IconEye />}
          label="Vues totales"
          value={stats.vuesTotal.toLocaleString("fr-FR")}
          sub="toutes pages"
          accent="#C9A84C"
        />
      </div>

      {/* Deux colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Articles en attente */}
        <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0]">
            <h2 className="text-[14px] font-bold text-[#111]">À valider</h2>
            <Link
              href="/admin/articles?statut=PENDING"
              className="text-[11px] font-semibold text-[#bbb] hover:text-[#E53935] transition-colors"
            >
              Tout voir →
            </Link>
          </div>

          {stats.dernieresPending.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-[#bbb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="text-[13px] text-[#bbb]">Aucun article en attente</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#F8F8F8]">
              {stats.dernieresPending.map((a) => (
                <li key={a.id} className="px-6 py-3.5 flex items-center gap-3">
                  <span
                    className="flex-shrink-0 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded"
                    style={{
                      color: a.categorie.couleur,
                      backgroundColor: `${a.categorie.couleur}18`,
                    }}
                  >
                    {a.categorie.nom}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#111] line-clamp-1">
                      {a.titre}
                    </p>
                    <p className="text-[11px] text-[#bbb]">{formatDate(a.dateCreation)}</p>
                  </div>
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="flex-shrink-0 px-3 py-1.5 bg-[#111] text-white text-[11px] font-bold rounded hover:bg-[#E53935] transition-colors"
                  >
                    Réviser
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top articles */}
        <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F0F0F0]">
            <h2 className="text-[14px] font-bold text-[#111]">Top articles par vues</h2>
          </div>

          {stats.topArticles.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-[13px] text-[#bbb]">Aucun article publié</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#F8F8F8]">
              {stats.topArticles.map((a, i) => (
                <li key={a.id} className="px-6 py-3.5 flex items-center gap-4">
                  <span className="text-[20px] font-black text-[#E8E8E8] w-6 text-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#111] line-clamp-1">
                      {a.titre}
                    </p>
                    <span
                      className="text-[10px] font-bold tracking-wider uppercase"
                      style={{ color: a.categorie.couleur }}
                    >
                      {a.categorie.nom}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 text-[12px] font-bold text-[#999]">
                    <svg className="w-3.5 h-3.5 text-[#ccc]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {a.vues.toLocaleString("fr-FR")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* File d'attente */}
      {(stats.articlesEnFile.length > 0 || stats.socialEnFile.length > 0) && (
        <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden mb-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0]">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <h2 className="text-[14px] font-bold text-[#111]">File d&apos;attente</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                {stats.articlesEnFile.length + stats.socialEnFile.length}
              </span>
            </div>
            <Link href="/admin/social-queue" className="text-[11px] font-semibold text-[#bbb] hover:text-blue-600 transition-colors">
              Tout voir →
            </Link>
          </div>
          <ul className="divide-y divide-[#F8F8F8]">
            {stats.articlesEnFile.map((a) => (
              <li key={a.id} className="px-6 py-3 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.categorie.couleur }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#111] line-clamp-1">{a.titre}</p>
                  <p className="text-[11px] text-[#bbb]">{a.categorie.nom}</p>
                </div>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 flex-shrink-0">
                  Article · {a.scheduledFor ? new Date(a.scheduledFor).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""}
                </span>
              </li>
            ))}
            {stats.socialEnFile.map((p) => (
              <li key={p.id} className="px-6 py-3 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#111] line-clamp-1">{p.article.titre}</p>
                </div>
                <span className="text-[11px] font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded border border-pink-100 flex-shrink-0 capitalize">
                  {p.network} · {new Date(p.scheduledAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F0F0F0]">
            <h2 className="text-[14px] font-bold text-[#111]">Raccourcis</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {[
              { href: "/admin/articles?statut=PENDING", value: stats.totalPending,  label: "En attente",    color: "#E53935" },
              { href: "/admin/commentaires",            value: stats.totalAvisPending, label: "Commentaires", color: "#C9A84C" },
              { href: "/admin/articles",                value: stats.totalPublies,  label: "Publiés",       color: "#111" },
              { href: "/admin/newsletter",              value: stats.totalAbonnes,  label: "Abonnés",       color: "#3B82F6" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="p-4 rounded-lg border border-[#EBEBEB] hover:border-current/30 transition-all group"
                style={{ "--hover-color": item.color } as React.CSSProperties}
              >
                <p className="text-[26px] font-black leading-none" style={{ color: item.color }}>
                  {item.value.toLocaleString("fr-FR")}
                </p>
                <p className="text-[12px] text-[#999] mt-1">{item.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sub,
  accent,
  href,
  urgent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub: string;
  accent: string;
  href?: string;
  urgent?: boolean;
}) {
  const inner = (
    <div
      className={`bg-white rounded-xl border p-5 h-full transition-all ${
        urgent ? "border-[#E53935]/40" : "border-[#EBEBEB] hover:border-[#ccc]"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accent}14` }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </div>
        {urgent && <span className="w-2 h-2 rounded-full bg-[#E53935] animate-pulse mt-1" />}
      </div>
      <p className="text-[28px] font-black leading-none" style={{ color: accent }}>
        {value}
      </p>
      <p className="text-[12px] font-semibold text-[#333] mt-2">{label}</p>
      <p className="text-[11px] text-[#bbb] mt-0.5">{sub}</p>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

// ── Icônes ────────────────────────────────────────────────────────────────────

function IconPublished() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" x2="8" y1="13" y2="13"/>
      <line x1="16" x2="8" y1="17" y2="17"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function IconMail() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function IconEye() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
