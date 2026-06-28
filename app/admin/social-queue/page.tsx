import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import QueueActions from "./QueueActions";

export const metadata: Metadata = { title: "File d'attente" };
export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Date(d).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const NETWORK_LABEL: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
};

const NETWORK_COLOR: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E1306C",
};

export default async function SocialQueuePage() {
  const now = new Date();

  let articles: {
    id: string; titre: string; scheduledFor: Date | null;
    categorie: { nom: string; couleur: string };
  }[] = [];
  let socialPosts: {
    id: string; network: string; message: string; scheduledAt: Date;
    article: { titre: string };
  }[] = [];
  let recentDone: { id: string; network: string; processedAt: Date | null; article: { titre: string } }[] = [];
  let recentErrors: { id: string; network: string; processedAt: Date | null; erreur: string | null; article: { titre: string } }[] = [];
  let dbReady = true;

  try {
    [articles, socialPosts, recentDone, recentErrors] = await Promise.all([
      prisma.article.findMany({
        where: { statut: "PENDING", scheduledFor: { not: null } },
        select: {
          id: true, titre: true, scheduledFor: true,
          categorie: { select: { nom: true, couleur: true } },
        },
        orderBy: { scheduledFor: "asc" },
      }),
      prisma.socialQueueItem.findMany({
        where: { statut: "PENDING" },
        select: {
          id: true, network: true, message: true, scheduledAt: true,
          article: { select: { titre: true } },
        },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.socialQueueItem.findMany({
        where: { statut: "DONE" },
        select: { id: true, network: true, processedAt: true, article: { select: { titre: true } } },
        orderBy: { processedAt: "desc" },
        take: 5,
      }),
      prisma.socialQueueItem.findMany({
        where: { statut: "ERROR" },
        select: { id: true, network: true, processedAt: true, erreur: true, article: { select: { titre: true } } },
        orderBy: { processedAt: "desc" },
        take: 5,
      }),
    ]);
  } catch {
    dbReady = false;
  }

  const totalPending = articles.length + socialPosts.length;

  if (!dbReady) {
    return (
      <div className="max-w-[900px]">
        <div className="mb-8">
          <h1 className="text-[22px] font-black text-[#111]">File d&apos;attente</h1>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-[13px] text-orange-800">
          <p className="font-bold mb-1">Base de données pas encore à jour</p>
          <p>La table de file d&apos;attente n&apos;existe pas encore. Déploie sur Vercel pour l&apos;activer — le build applique automatiquement les changements de base de données.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-black text-[#111]">File d&apos;attente</h1>
          <p className="text-[13px] text-[#999] mt-0.5">
            {totalPending === 0 ? "Aucun élément en attente" : `${totalPending} élément${totalPending > 1 ? "s" : ""} en attente`}
            {" · "}Publication toutes les 15 min
          </p>
        </div>
        {totalPending > 0 && <QueueActions />}
      </div>

      {/* Articles en file */}
      <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-[#111]">
            Articles
            {articles.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                {articles.length}
              </span>
            )}
          </h2>
        </div>

        {articles.length === 0 ? (
          <div className="px-6 py-10 text-center text-[13px] text-[#bbb]">
            Aucun article en file — utilisez le bouton <strong>⏱ File</strong> dans la liste articles.
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#F0F0F0]">
                <th className="text-left px-6 py-3 text-[11px] font-bold tracking-wider uppercase text-[#bbb]">Article</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-[#bbb]">Programmé</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-[#bbb]">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8F8F8]">
              {articles.map((a) => {
                const isPast = a.scheduledFor! < now;
                return (
                  <tr key={a.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.categorie.couleur }} />
                        <span className="font-semibold text-[#111] line-clamp-1">{a.titre}</span>
                      </div>
                      <p className="text-[11px] text-[#999] mt-0.5 pl-4.5">{a.categorie.nom}</p>
                    </td>
                    <td className="px-4 py-4 text-[12px] text-[#555]">
                      {formatDate(a.scheduledFor!)}
                    </td>
                    <td className="px-4 py-4">
                      {isPast ? (
                        <span className="px-2 py-1 text-[10px] font-bold rounded bg-orange-50 text-orange-700 border border-orange-200">
                          En cours…
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
                          Programmé
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <QueueActions articleId={a.id} variant="remove-article" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Posts réseaux sociaux en file */}
      <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-[#F0F0F0]">
          <h2 className="text-[14px] font-bold text-[#111]">
            Réseaux sociaux
            {socialPosts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                {socialPosts.length}
              </span>
            )}
          </h2>
        </div>

        {socialPosts.length === 0 ? (
          <div className="px-6 py-10 text-center text-[13px] text-[#bbb]">
            Aucun post en file — utilisez <strong>Ajouter à la file</strong> dans le modal de partage d&apos;un article.
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#F0F0F0]">
                <th className="text-left px-6 py-3 text-[11px] font-bold tracking-wider uppercase text-[#bbb]">Article</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-[#bbb]">Réseau</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-[#bbb]">Programmé</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8F8F8]">
              {socialPosts.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-[#111] line-clamp-1">{p.article.titre}</span>
                    <p className="text-[11px] text-[#999] mt-0.5 line-clamp-2">{p.message.slice(0, 80)}…</p>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className="px-2.5 py-1 text-[11px] font-bold rounded text-white"
                      style={{ backgroundColor: NETWORK_COLOR[p.network] || "#666" }}
                    >
                      {NETWORK_LABEL[p.network] || p.network}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[12px] text-[#555]">
                    {formatDate(p.scheduledAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <QueueActions socialId={p.id} variant="remove-social" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Historique */}
      {(recentDone.length > 0 || recentErrors.length > 0) && (
        <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F0F0F0]">
            <h2 className="text-[14px] font-bold text-[#111]">Historique récent</h2>
          </div>
          <div className="p-4 space-y-2">
            {recentErrors.map((e) => (
              <div key={e.id} className="flex items-start gap-3 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-[12px]">
                <span className="text-red-500 font-bold flex-shrink-0">✗</span>
                <div>
                  <span className="font-semibold text-[#111]">{e.article.titre}</span>
                  <span className="text-[#999] mx-1.5">·</span>
                  <span style={{ color: NETWORK_COLOR[e.network] }} className="font-bold">{NETWORK_LABEL[e.network]}</span>
                  <p className="text-red-600 mt-0.5">{e.erreur}</p>
                </div>
              </div>
            ))}
            {recentDone.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-3 py-2.5 bg-green-50 border border-green-100 rounded-lg text-[12px]">
                <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                <span className="font-semibold text-[#111]">{d.article.titre}</span>
                <span className="text-[#999] mx-0.5">·</span>
                <span style={{ color: NETWORK_COLOR[d.network] }} className="font-bold">{NETWORK_LABEL[d.network]}</span>
                <span className="text-[#999] ml-auto">{d.processedAt ? formatDate(d.processedAt) : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
