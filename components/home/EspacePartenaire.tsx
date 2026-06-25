import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Props {
  variant?: "home" | "sidebar";
}

export default async function EspacePartenaire({ variant = "home" }: Props) {
  const partenaires = await prisma.espacePartenaire.findMany({
    where: { actif: true },
    orderBy: { ordre: "asc" },
    take: 3,
  });

  const slots = Array.from({ length: 3 }, (_, i) => partenaires[i] ?? null);

  const isSidebar = variant === "sidebar";

  return (
    <section className={isSidebar ? "space-y-3" : "my-8 md:my-12"}>
      <div className={isSidebar ? "flex flex-col gap-3" : "grid grid-cols-3 gap-4 md:gap-6"}>
        {slots.map((slot, i) =>
          slot ? (
            <a
              key={slot.id}
              href={`/api/partenaires/${slot.id}/click`}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative block overflow-hidden border border-[#C9A84C]/50 hover:border-[#C9A84C] transition-colors duration-200 ${isSidebar ? "h-28 w-full" : "h-40 md:h-52"}`}
            >
              {slot.imageUrl ? (
                <Image
                  src={slot.imageUrl}
                  alt={slot.titre}
                  fill
                  className="object-contain p-3"
                  sizes={isSidebar ? "300px" : "(max-width: 768px) 33vw, 25vw"}
                />
              ) : (
                <div className="absolute inset-0 bg-[#111] flex items-center justify-center">
                  <span className="text-[#C9A84C] font-bold text-xs font-mono">{slot.titre}</span>
                </div>
              )}
            </a>
          ) : (
            <Link
              key={i}
              href="/partenaires"
              className={`group flex flex-col items-center justify-center gap-2 bg-[#111] border border-dashed border-[#C9A84C]/30 hover:border-[#C9A84C] transition-colors duration-200 ${isSidebar ? "h-28 w-full" : "h-40 md:h-52"}`}
            >
              <div className="w-8 h-8 border border-[#C9A84C]/30 group-hover:border-[#C9A84C] flex items-center justify-center transition-colors">
                <span className="text-[#C9A84C]/40 group-hover:text-[#C9A84C] font-bold text-[9px] font-mono transition-colors">LOGO</span>
              </div>
              <p className="text-[9px] font-bold tracking-widest uppercase text-[#C9A84C] text-center">Espace partenaire</p>
              <p className="text-white/40 group-hover:text-white text-[10px] font-medium transition-colors text-center">Votre marque ici</p>
            </Link>
          )
        )}
      </div>
    </section>
  );
}
