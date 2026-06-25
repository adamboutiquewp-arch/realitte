import Link from "next/link";

const SLOTS = [
  { label: "Espace partenaire", cta: "Votre marque ici" },
  { label: "Espace partenaire", cta: "Votre marque ici" },
  { label: "Espace partenaire", cta: "Votre marque ici" },
];

export default function EspacePartenaire() {
  return (
    <section className="my-8 md:my-12">
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {SLOTS.map((slot, i) => (
          <Link
            key={i}
            href="/partenaires"
            className="group flex flex-col items-center justify-center gap-3 bg-[#111] border border-[#C9A84C]/30 hover:border-[#C9A84C] transition-colors duration-200 aspect-square p-4"
          >
            {/* Logo placeholder */}
            <div className="w-10 h-10 md:w-14 md:h-14 border border-[#C9A84C]/50 group-hover:border-[#C9A84C] flex items-center justify-center transition-colors">
              <span className="text-[#C9A84C]/50 group-hover:text-[#C9A84C] font-bold text-xs md:text-sm font-mono transition-colors">
                LOGO
              </span>
            </div>

            <div className="text-center">
              <p className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-[#C9A84C] mb-1">
                {slot.label}
              </p>
              <p className="text-white/60 group-hover:text-white text-[10px] md:text-[12px] font-medium leading-tight transition-colors">
                {slot.cta}
              </p>
            </div>

            <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-white/40 group-hover:text-white border border-white/20 group-hover:border-white px-2 md:px-3 py-1 transition-colors">
              EN SAVOIR +
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
