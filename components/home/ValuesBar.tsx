const VALUES = [
  {
    icon: ShieldIcon,
    titre: "100% Indépendant",
    texte: "Notre liberté éditoriale est notre force.",
  },
  {
    icon: CheckIcon,
    titre: "Vérifié & sourcé",
    texte: "Chaque information compte et se vérifie.",
  },
  {
    icon: HeartIcon,
    titre: "Humain & engagé",
    texte: "Derrière chaque histoire, il y a des êtres humains.",
  },
  {
    icon: StarIcon,
    titre: "Inspirant & utile",
    texte: "Des contenus concrets pour avancer.",
  },
];

export default function ValuesBar() {
  return (
    <section className="bg-[#F5F5F5] py-10 md:py-12">
      <div className="container-site">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {VALUES.map(({ icon: Icon, titre, texte }) => (
            <div key={titre} className="flex flex-col items-center text-center gap-3">
              <div className="text-[#9E9E9E]">
                <Icon size={28} />
              </div>
              <div>
                <p className="text-[13px] font-black uppercase tracking-wider text-[#111111] mb-1">
                  {titre}
                </p>
                <p className="text-[12px] text-[#424242] leading-relaxed">{texte}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShieldIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function CheckIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

function HeartIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function StarIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
