import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDateFull } from "@/lib/utils";

export const metadata: Metadata = { title: "Newsletter" };
export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const [abonnes, total] = await Promise.all([
    prisma.abonneNewsletter.findMany({
      orderBy: { dateInscription: "desc" },
      take: 100,
    }),
    prisma.abonneNewsletter.count({ where: { actif: true } }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#111111]">Newsletter</h1>
          <p className="text-[13px] text-[#9E9E9E]">{total} abonné{total > 1 ? "s" : ""} actif{total > 1 ? "s" : ""}</p>
        </div>
        <a
          href="/api/newsletter/export"
          className="px-5 py-2.5 border border-[#E0E0E0] text-[12px] font-bold tracking-widest uppercase hover:border-black transition-colors"
        >
          Exporter CSV
        </a>
      </div>

      <div className="bg-white overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b-2 border-[#E0E0E0]">
              <th className="text-left px-5 py-4 text-[11px] font-bold tracking-widest uppercase text-[#9E9E9E]">Email</th>
              <th className="text-left px-4 py-4 text-[11px] font-bold tracking-widest uppercase text-[#9E9E9E] hidden md:table-cell">Inscrit le</th>
              <th className="text-left px-4 py-4 text-[11px] font-bold tracking-widest uppercase text-[#9E9E9E]">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F5F5]">
            {abonnes.map((a) => (
              <tr key={a.id} className="hover:bg-[#FAFAFA]">
                <td className="px-5 py-3.5 font-medium">{a.email}</td>
                <td className="px-4 py-3.5 text-[#9E9E9E] hidden md:table-cell">
                  {formatDateFull(a.dateInscription)}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`px-2 py-1 text-[11px] font-bold ${a.actif ? "bg-[#D4EDDA] text-[#155724]" : "bg-[#F8D7DA] text-[#721C24]"}`}>
                    {a.actif ? "Actif" : "Désinscrit"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
