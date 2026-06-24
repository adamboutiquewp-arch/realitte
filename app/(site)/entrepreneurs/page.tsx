import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Entrepreneurs de la semaine — Réalitte",
  description: "Découvrez chaque semaine un entrepreneur et une entreprise inspirante mis en avant par Réalitte.",
};

export const dynamic = "force-dynamic";

export default async function EntrepreneursPage() {
  const profils = await prisma.entrepreneurSemaine.findMany({
    where: { actif: true },
    orderBy: { semaineDu: "desc" },
  });

  const actuel = profils[0] ?? null;
  const archives = profils.slice(1);

  const formatSemaine = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));

  return (
    <div className="container-site py-10 md:py-14">
      {/* En-tête */}
      <div className="mb-10">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-[#E53935] mb-1">
          Vitrine
        </p>
        <h1 className="text-[28px] md:text-[36px] font-black tracking-tight text-[#111]">
          Entrepreneurs de la semaine
        </h1>
        <div className="w-8 h-[3px] bg-[#E53935] mt-3" />
        <p className="text-[14px] text-[#666] mt-4 max-w-xl">
          Chaque semaine, Réalitte met en lumière un entrepreneur et son entreprise. Inspiration, parcours et vision.
        </p>
      </div>

      {!actuel ? (
        <div className="bg-white border border-[#EBEBEB] rounded-2xl py-20 text-center">
          <p className="text-[15px] text-[#bbb]">Aucun profil disponible pour le moment.</p>
        </div>
      ) : (
        <>
          {/* Profil actuel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden shadow-sm mb-12">
            <div className="p-7 md:p-10 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-[#E53935] text-white text-[10px] font-black tracking-widest uppercase rounded-full mb-5">
                  Semaine du {formatSemaine(actuel.semaineDu)}
                </span>
                <div className="flex items-center gap-4 mb-6">
                  {actuel.entrepreneurPhoto ? (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#E53935]">
                      <Image src={actuel.entrepreneurPhoto} alt={actuel.entrepreneurNom} fill className="object-cover object-top" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center flex-shrink-0 border-2 border-[#E53935]">
                      <span className="text-2xl font-black text-[#E53935]">{actuel.entrepreneurNom[0]}</span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-[20px] font-black text-[#111]">{actuel.entrepreneurNom}</h2>
                    <p className="text-[12px] font-bold tracking-wider uppercase text-[#999] mt-0.5">{actuel.entrepreneurTitre}</p>
                  </div>
                </div>
                <blockquote className="border-l-4 border-[#E53935] pl-4 mb-5">
                  <p className="text-[15px] italic text-[#333] leading-relaxed">&ldquo;{actuel.entrepreneurCitation}&rdquo;</p>
                </blockquote>
                <p className="text-[13px] text-[#666] leading-relaxed">{actuel.entrepreneurBio}</p>
              </div>
            </div>
            <div className="bg-[#0F0F0F] p-7 md:p-10 flex flex-col justify-between text-white">
              <div>
                <p className="text-[10px] font-black tracking-[0.2em] uppercase text-[#E53935] mb-4">L&apos;entreprise</p>
                <div className="flex items-center gap-4 mb-5">
                  {actuel.entrepriseLogo ? (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white">
                      <Image src={actuel.entrepriseLogo} alt={actuel.entrepriseNom} fill className="object-contain p-1" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-black text-white">{actuel.entrepriseNom[0]}</span>
                    </div>
                  )}
                  <h3 className="text-[20px] font-black">{actuel.entrepriseNom}</h3>
                </div>
                <p className="text-[13px] text-[#aaa] leading-relaxed">{actuel.entrepriseDescription}</p>
              </div>
              {actuel.entrepriseSite && (
                <a href={actuel.entrepriseSite} target="_blank" rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E53935] text-white text-[12px] font-black tracking-widest uppercase hover:bg-white hover:text-[#E53935] transition-colors rounded-lg">
                  Découvrir l&apos;entreprise →
                </a>
              )}
            </div>
          </div>

          {/* Archives */}
          {archives.length > 0 && (
            <>
              <h2 className="text-[16px] font-black tracking-tight uppercase text-[#111] mb-5">
                Anciens profils
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {archives.map((p) => (
                  <div key={p.id} className="bg-white border border-[#EBEBEB] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-[#bbb] mb-3">
                        Semaine du {formatSemaine(p.semaineDu)}
                      </p>
                      <div className="flex items-center gap-3 mb-3">
                        {p.entrepreneurPhoto ? (
                          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-[#E8E8E8]">
                            <Image src={p.entrepreneurPhoto} alt={p.entrepreneurNom} fill className="object-cover object-top" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-black text-[#E53935]">{p.entrepreneurNom[0]}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-[14px] font-black text-[#111]">{p.entrepreneurNom}</p>
                          <p className="text-[11px] text-[#999]">{p.entrepreneurTitre}</p>
                        </div>
                      </div>
                      <p className="text-[12px] text-[#444] font-bold">{p.entrepriseNom}</p>
                      <p className="text-[12px] text-[#888] mt-1 line-clamp-2">{p.entrepriseDescription}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
