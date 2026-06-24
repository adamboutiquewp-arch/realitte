import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Commentaires" };
export const dynamic = "force-dynamic";

async function moderateAvis(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const action = formData.get("action") as string;
  if (!id || !action) return;

  await prisma.avis.update({
    where: { id },
    data: { statut: action === "approve" ? "APPROVED" : "REJECTED" },
  });

  revalidatePath("/admin/commentaires");
  redirect("/admin/commentaires");
}

async function deleteAvis(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.avis.delete({ where: { id } });
  revalidatePath("/admin/commentaires");
  redirect("/admin/commentaires");
}

interface PageProps {
  searchParams: Promise<{ statut?: string }>;
}

const STATUT_STYLE: Record<string, string> = {
  PENDING:  "bg-orange-50 text-orange-700 border border-orange-200",
  APPROVED: "bg-green-50  text-green-700  border border-green-200",
  REJECTED: "bg-red-50    text-red-700    border border-red-200",
};

const STATUT_LABEL: Record<string, string> = {
  PENDING:  "En attente",
  APPROVED: "Approuvé",
  REJECTED: "Rejeté",
};

export default async function AdminCommentairesPage({ searchParams }: PageProps) {
  const { statut } = await searchParams;

  const where: Record<string, unknown> = {};
  if (statut) where.statut = statut;

  const [avis, totals] = await Promise.all([
    prisma.avis.findMany({
      where,
      orderBy: { dateCreation: "desc" },
      take: 50,
      include: {
        article: { select: { titre: true, slug: true, categorie: { select: { slug: true } } } },
      },
    }),
    prisma.avis.groupBy({
      by: ["statut"],
      _count: true,
    }),
  ]);

  const counts = totals.reduce(
    (acc, g) => ({ ...acc, [g.statut]: g._count }),
    {} as Record<string, number>
  );

  const FILTRES = [
    { value: "",         label: "Tous",         count: Object.values(counts).reduce((a, b) => a + b, 0) },
    { value: "PENDING",  label: "En attente",   count: counts.PENDING || 0 },
    { value: "APPROVED", label: "Approuvés",    count: counts.APPROVED || 0 },
    { value: "REJECTED", label: "Rejetés",      count: counts.REJECTED || 0 },
  ];

  return (
    <div className="max-w-[900px]">
      <div className="mb-8">
        <h1 className="text-[22px] font-black text-[#111]">Commentaires</h1>
        <p className="text-[13px] text-[#999] mt-0.5">Modération des avis lecteurs</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-[#EBEBEB] p-4 mb-5 flex flex-wrap gap-2">
        {FILTRES.map((f) => {
          const active = statut === f.value || (!statut && !f.value);
          return (
            <Link
              key={f.value}
              href={`/admin/commentaires${f.value ? `?statut=${f.value}` : ""}`}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                active ? "bg-[#111] text-white" : "bg-[#F5F5F5] text-[#666] hover:bg-[#EBEBEB]"
              }`}
            >
              {f.label}
              {f.count > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  active ? "bg-white/20" : "bg-[#E0E0E0]"
                }`}>
                  {f.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {avis.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#EBEBEB] py-16 text-center">
            <p className="text-[14px] text-[#bbb]">Aucun commentaire.</p>
          </div>
        ) : (
          avis.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-[#EBEBEB] p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F0F0F0] flex items-center justify-center text-[13px] font-bold text-[#666] flex-shrink-0">
                    {a.auteurNom.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#111]">{a.auteurNom}</p>
                    {a.email && <p className="text-[11px] text-[#bbb]">{a.email}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${STATUT_STYLE[a.statut]}`}>
                    {STATUT_LABEL[a.statut]}
                  </span>
                  <span className="text-[11px] text-[#bbb]">{formatDate(a.dateCreation)}</span>
                </div>
              </div>

              <p className="text-[13px] text-[#444] mb-3 leading-relaxed">{a.commentaire}</p>

              <div className="flex items-center justify-between">
                <Link
                  href={`/${a.article.categorie.slug}/${a.article.slug}`}
                  target="_blank"
                  className="text-[11px] text-[#bbb] hover:text-[#E53935] transition-colors line-clamp-1 max-w-xs"
                >
                  ↗ {a.article.titre}
                </Link>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {a.statut !== "APPROVED" && (
                    <form action={moderateAvis}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-green-600 text-white text-[11px] font-bold rounded hover:bg-green-700 transition-colors"
                      >
                        Approuver
                      </button>
                    </form>
                  )}
                  {a.statut !== "REJECTED" && (
                    <form action={moderateAvis}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="action" value="reject" />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#F5F5F5] text-[#666] text-[11px] font-bold rounded hover:bg-[#E53935] hover:text-white transition-colors"
                      >
                        Rejeter
                      </button>
                    </form>
                  )}
                  <form action={deleteAvis}>
                    <input type="hidden" name="id" value={a.id} />
                    <button
                      type="submit"
                      className="text-[11px] text-[#bbb] hover:text-[#E53935] font-medium transition-colors"
                    >
                      Supprimer
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
