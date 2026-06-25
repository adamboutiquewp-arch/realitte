import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function EspacePartenaire() {
  const partenaires = await prisma.espacePartenaire.findMany({
    where: { actif: true },
    orderBy: { ordre: "asc" },
    take: 3,
  });

  const slots = Array.from({ length: 3 }, (_, i) => partenaires[i] ?? null);

  return (
    <section className="my-8 md:my-12">
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {slots.map((slot, i) =>
          slot ? (
            /* Slot occupé — image remplit tout le carré, tout est cliquable */
            <a
              key={slot.id}
              href={slot.lien || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block aspect-square overflow-hidden border border-[#C9A84C]/50 hover:border-[#C9A84C] transition-colors duration-200"
            >
              {slot.imageUrl ? (
                <Image
                  src={slot.imageUrl}
                  alt={slot.titre}
                  fill
                  className="object-contain p-3"
                  sizes="(max-width: 768px) 33vw, 20vw"
                />
              ) : (
                <div className="absolute inset-0 bg-[#111] flex items-center justify-center">
                  <span className="text-[#C9A84C] font-bold text-xs font-mono">{slot.titre}</span>
                </div>
              )}
            </a>
          ) : (
            /* Slot vide — placeholder */
            <Link
              key={i}
              href="/partenaires"
              className="group flex flex-col items-center justify-center gap-3 bg-[#111] border border-dashed border-[#C9A84C]/30 hover:border-[#C9A84C] transition-colors duration-200 aspect-square p-4"
            >
              <div className="w-10 h-10 md:w-14 md:h-14 border border-[#C9A84C]/30 group-hover:border-[#C9A84C] flex items-center justify-center transition-colors">
                <span className="text-[#C9A84C]/40 group-hover:text-[#C9A84C] font-bold text-xs font-mono transition-colors">LOGO</span>
              </div>
              <div className="text-center">
                <p className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-[#C9A84C] mb-1">Espace partenaire</p>
                <p className="text-white/40 group-hover:text-white text-[10px] md:text-[12px] font-medium transition-colors">Votre marque ici</p>
              </div>
              <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-white/30 group-hover:text-white border border-white/20 group-hover:border-white px-2 md:px-3 py-1 transition-colors">
                EN SAVOIR +
              </span>
            </Link>
          )
        )}
      </div>
    </section>
  );
}
