import Image from "next/image";
import Link from "next/link";

interface Props {
  entrepreneur: {
    id: string;
    entrepreneurNom: string;
    entrepreneurTitre: string;
    entrepreneurBio: string;
    entrepreneurCitation: string;
    entrepreneurPhoto: string | null;
    entrepriseNom: string;
    entrepriseDescription: string;
    entrepriseLogo: string | null;
    entrepriseSite: string | null;
    semaineDu: Date;
  };
}

export default function EntrepreneurSemaine({ entrepreneur: e }: Props) {
  const semaine = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(e.semaineDu));

  return (
    <section className="py-10 md:py-14">
      {/* En-tête section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-[#E53935] mb-1">
            Semaine du {semaine}
          </p>
          <h2 className="text-[22px] md:text-[26px] font-black tracking-tight text-[#111]">
            Entrepreneur de la semaine
          </h2>
          <div className="w-8 h-[3px] bg-[#E53935] mt-2" />
        </div>
        <Link
          href="/entrepreneurs"
          className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-[#999] hover:text-[#E53935] transition-colors"
        >
          Voir les archives →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden shadow-sm">
        {/* Entrepreneur */}
        <div className="p-7 md:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-6">
              {e.entrepreneurPhoto ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#E53935]">
                  <Image
                    src={e.entrepreneurPhoto}
                    alt={e.entrepreneurNom}
                    fill
                    className="object-cover object-top"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center flex-shrink-0 border-2 border-[#E53935]">
                  <span className="text-2xl font-black text-[#E53935]">
                    {e.entrepreneurNom[0]}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-[19px] font-black text-[#111] leading-tight">
                  {e.entrepreneurNom}
                </h3>
                <p className="text-[12px] font-bold tracking-wider uppercase text-[#999] mt-0.5">
                  {e.entrepreneurTitre}
                </p>
              </div>
            </div>

            {/* Citation */}
            <blockquote className="border-l-4 border-[#E53935] pl-4 mb-5">
              <p className="text-[15px] italic text-[#333] leading-relaxed">
                &ldquo;{e.entrepreneurCitation}&rdquo;
              </p>
            </blockquote>

            <p className="text-[13px] text-[#666] leading-relaxed">
              {e.entrepreneurBio}
            </p>
          </div>
        </div>

        {/* Entreprise */}
        <div className="bg-[#0F0F0F] p-7 md:p-10 flex flex-col justify-between text-white">
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-[#E53935] mb-4">
              L&apos;entreprise
            </p>
            <div className="flex items-center gap-4 mb-5">
              {e.entrepriseLogo ? (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white">
                  <Image
                    src={e.entrepriseLogo}
                    alt={e.entrepriseNom}
                    fill
                    className="object-contain p-1"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-black text-white">
                    {e.entrepriseNom[0]}
                  </span>
                </div>
              )}
              <h3 className="text-[20px] font-black leading-tight">
                {e.entrepriseNom}
              </h3>
            </div>

            <p className="text-[13px] text-[#aaa] leading-relaxed">
              {e.entrepriseDescription}
            </p>
          </div>

          {e.entrepriseSite && (
            <a
              href={e.entrepriseSite}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E53935] text-white text-[12px] font-black tracking-widest uppercase hover:bg-white hover:text-[#E53935] transition-colors rounded-lg"
            >
              Découvrir l&apos;entreprise →
            </a>
          )}
        </div>
      </div>

      <div className="mt-4 sm:hidden text-center">
        <Link
          href="/entrepreneurs"
          className="text-[11px] font-bold tracking-widest uppercase text-[#999] hover:text-[#E53935] transition-colors"
        >
          Voir les archives →
        </Link>
      </div>
    </section>
  );
}
