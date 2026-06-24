import Image from "next/image";
import Link from "next/link";

interface Props {
  entrepreneur: {
    entrepreneurNom: string;
    entrepreneurTitre: string;
    entrepreneurPhoto: string | null;
    entrepriseNom: string;
    entrepriseSite: string | null;
    semaineDu: Date;
  };
}

export default function EntrepreneurCard({ entrepreneur: e }: Props) {
  return (
    <div className="mt-10 pt-8 border-t border-[#E0E0E0]">
      <p className="text-[10px] font-black tracking-[0.2em] uppercase text-[#E53935] mb-1">
        Entrepreneur de la semaine
      </p>
      <div className="w-6 h-[3px] bg-[#E53935] mb-4" />

      <div className="flex items-center gap-3 mb-3">
        {e.entrepreneurPhoto ? (
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#E53935]">
            <Image src={e.entrepreneurPhoto} alt={e.entrepreneurNom} fill className="object-cover object-top" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center flex-shrink-0 border-2 border-[#E53935]">
            <span className="text-lg font-black text-[#E53935]">{e.entrepreneurNom[0]}</span>
          </div>
        )}
        <div>
          <p className="text-[14px] font-black text-[#111] leading-tight">{e.entrepreneurNom}</p>
          <p className="text-[11px] text-[#999]">{e.entrepreneurTitre}</p>
        </div>
      </div>

      <p className="text-[12px] font-bold text-[#444] mb-4">{e.entrepriseNom}</p>

      <Link
        href="/entrepreneurs"
        className="inline-flex items-center px-5 py-3 bg-black text-white text-[11px] font-bold tracking-widest uppercase hover:bg-[#E53935] transition-colors"
      >
        Voir le profil
      </Link>
    </div>
  );
}
