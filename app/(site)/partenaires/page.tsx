import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Partenaires & Sponsors",
  description: "Associez votre marque à Réalitte, le média indépendant qui dit la vérité. Découvrez nos formats de partenariat.",
};

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [articles, abonnes] = await Promise.all([
      prisma.article.count({ where: { statut: "PUBLISHED" } }),
      prisma.abonneNewsletter.count({ where: { actif: true } }),
    ]);
    return { articles, abonnes };
  } catch {
    return { articles: 0, abonnes: 0 };
  }
}

export default async function PartenairesPage() {
  const stats = await getStats();

  const formats = [
    {
      titre: "Article sponsorisé",
      description: "Un article rédigé autour de votre marque, publié dans la rubrique la plus pertinente. Format natif, lu comme un vrai article.",
      prix: "Sur devis",
      icone: "✍️",
    },
    {
      titre: "Newsletter sponsorisée",
      description: "Votre message mis en avant dans notre newsletter hebdomadaire, envoyée à tous nos abonnés actifs.",
      prix: "Sur devis",
      icone: "📩",
    },
    {
      titre: "Bannière article",
      description: "Votre visuel affiché dans la sidebar de nos articles, visible sur toutes les pages de la rubrique choisie.",
      prix: "Sur devis",
      icone: "🖼️",
    },
    {
      titre: "Mention rubrique",
      description: "Votre marque associée à une rubrique spécifique — sport, créateurs, entrepreneurs — pendant une période définie.",
      prix: "Sur devis",
      icone: "🏷️",
    },
  ];

  const thematiques = [
    { label: "Actu", couleur: "#E53935" },
    { label: "Sport", couleur: "#1565C0" },
    { label: "Politique", couleur: "#6A1B9A" },
    { label: "Créateurs", couleur: "#7C3AED" },
    { label: "Entrepreneurs", couleur: "#C9A84C" },
  ];

  return (
    <>
      {/* Hero */}
      <div className="bg-black text-white py-20 md:py-28">
        <div className="container-site max-w-3xl">
          <p className="text-[11px] tracking-widest uppercase text-[#E53935] font-bold mb-4">
            Partenariats
          </p>
          <h1
            className="text-4xl md:text-5xl font-black leading-tight mb-6"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Associez votre marque<br />
            <span className="text-[#E53935]">à un média qui dit la vérité.</span>
          </h1>
          <p className="text-[16px] text-white/70 leading-relaxed max-w-2xl">
            Réalitte touche une audience engagée, curieuse et exigeante.
            Des lecteurs qui veulent comprendre le monde — et qui font confiance
            aux marques qui soutiennent un média indépendant.
          </p>
          <a
            href="mailto:contact@realitte.com?subject=Partenariat Réalitte"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-[#E53935] text-white text-[12px] font-bold tracking-widest uppercase hover:bg-[#c62828] transition-colors"
          >
            Nous contacter
          </a>
        </div>
      </div>

      <div className="h-1 bg-[#E53935]" />

      {/* Chiffres clés */}
      <div className="bg-[#F5F5F5] py-12">
        <div className="container-site">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
            {[
              { valeur: stats.articles.toString(), label: "Articles publiés" },
              { valeur: stats.abonnes.toString(), label: "Abonnés newsletter" },
              { valeur: "5", label: "Rubriques" },
              { valeur: "100%", label: "Indépendant" },
            ].map(({ valeur, label }) => (
              <div key={label}>
                <p
                  className="text-4xl font-black text-[#111]"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {valeur}
                </p>
                <p className="text-[12px] text-[#9E9E9E] mt-1 font-medium uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-site max-w-4xl py-16 md:py-20">

        {/* Formats */}
        <section className="mb-16">
          <p className="text-[11px] tracking-widest uppercase text-[#E53935] font-bold mb-2">Formats disponibles</p>
          <h2
            className="text-3xl font-bold text-[#111] mb-10"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Comment on peut travailler ensemble
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formats.map(({ titre, description, prix, icone }) => (
              <div key={titre} className="border border-[#E0E0E0] p-6 hover:border-[#E53935] transition-colors group">
                <div className="text-3xl mb-4">{icone}</div>
                <h3 className="text-[16px] font-bold text-[#111] mb-2">{titre}</h3>
                <p className="text-[13px] text-[#424242] leading-relaxed mb-4">{description}</p>
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#E53935]">{prix}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Thématiques */}
        <section className="mb-16">
          <p className="text-[11px] tracking-widest uppercase text-[#E53935] font-bold mb-2">Nos rubriques</p>
          <h2
            className="text-3xl font-bold text-[#111] mb-8"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Ciblez l&apos;audience qui vous correspond
          </h2>
          <div className="flex flex-wrap gap-3">
            {thematiques.map(({ label, couleur }) => (
              <span
                key={label}
                className="px-5 py-2.5 text-[12px] font-bold tracking-widest uppercase text-white"
                style={{ backgroundColor: couleur }}
              >
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-black text-white p-10 md:p-14 text-center">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Intéressé ?
          </h2>
          <p className="text-white/70 text-[15px] mb-8 max-w-lg mx-auto">
            Écrivez-nous avec votre projet et on vous répond sous 48h avec une proposition sur mesure.
          </p>
          <a
            href="mailto:contact@realitte.com?subject=Partenariat Réalitte"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#E53935] text-white text-[12px] font-bold tracking-widest uppercase hover:bg-[#c62828] transition-colors"
          >
            contact@realitte.com
          </a>
        </section>

      </div>
    </>
  );
}
