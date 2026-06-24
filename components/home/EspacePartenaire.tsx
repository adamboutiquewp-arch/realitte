interface EspacePartenaireProps {
  titre?: string;
  sousTitre?: string;
  ctaTexte?: string;
  lien?: string;
}

export default function EspacePartenaire({
  titre = "Votre marque ici, dans un environnement premium.",
  sousTitre = "ESPACE PARTENAIRE",
  ctaTexte = "EN SAVOIR PLUS",
  lien = "/partenaires",
}: EspacePartenaireProps) {
  return (
    <section className="my-8 md:my-12">
      <div className="bg-[#111111] border border-[#C9A84C]/30 px-6 md:px-10 py-7 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Gauche */}
        <div className="flex items-center gap-5">
          {/* Logo placeholder */}
          <div className="flex-shrink-0 w-14 h-14 border border-[#C9A84C] flex items-center justify-center">
            <span className="text-[#C9A84C] font-bold text-lg leading-none font-mono">CJ</span>
          </div>

          <div>
            <p className="text-[11px] font-bold tracking-widest uppercase text-[#C9A84C] mb-1">
              {sousTitre}
            </p>
            <p className="text-white font-bold text-[16px] md:text-[18px] leading-snug">
              {titre}
            </p>
          </div>
        </div>

        {/* CTA */}
        <a
          href={lien}
          className="flex-shrink-0 inline-flex items-center px-6 py-3 border border-white text-white text-[12px] font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors duration-200"
        >
          {ctaTexte}
        </a>
      </div>
    </section>
  );
}
