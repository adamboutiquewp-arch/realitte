import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos",
  description: "Réalitte est né d'un ras-le-bol. Celui des médias qui ne disent pas la vérité. Ici, on est libres de dire ce qu'on veut.",
};

export default function AProposPage() {
  return (
    <>
      {/* Hero */}
      <div className="bg-black text-white py-20 md:py-28">
        <div className="container-site max-w-3xl">
          <p className="text-[11px] tracking-widest uppercase text-[#E53935] font-bold mb-4">
            Notre histoire
          </p>
          <h1
            className="text-4xl md:text-6xl font-black leading-tight mb-6"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            On en avait marre.<br />
            <span className="text-[#E53935]">Alors on a créé Réalitte.</span>
          </h1>
          <p className="text-[17px] text-white/70 leading-relaxed max-w-2xl">
            Marre des médias qui tournent autour du pot. Marre des sujets évités,
            des vérités édulcorées, des infos formatées pour plaire à tout le monde
            et ne déranger personne.
          </p>
        </div>
      </div>

      {/* Bande rouge */}
      <div className="h-1 bg-[#E53935]" />

      {/* Corps */}
      <div className="container-site max-w-3xl py-16 md:py-20">

        {/* Manifeste */}
        <section className="mb-16">
          <h2
            className="text-3xl font-bold mb-6 text-[#111]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Ce qu&apos;on est
          </h2>
          <div className="space-y-5 text-[15px] md:text-[16px] text-[#424242] leading-relaxed">
            <p>
              <strong className="text-[#111]">Réalitte</strong>, c&apos;est un média indépendant, libre.
              Libre de dire ce qu&apos;on veut, de couvrir ce que les autres ignorent,
              d&apos;appeler les choses par leur nom.
            </p>
            <p>
              On parle d&apos;actu, de sport, de politique, de créateurs et d&apos;entrepreneurs —
              ceux qui construisent quelque chose de vrai dans un monde qui préfère
              souvent le bruit à la substance.
            </p>
            <p>
              Ici, pas de ligne éditoriale dictée par des actionnaires. Pas de
              sujets tabous. Pas de langue de bois. On dit ce qu&apos;on pense,
              on montre ce qui se passe, et on vous fait confiance pour vous
              forger votre propre opinion.
            </p>
          </div>
        </section>

        {/* Valeurs */}
        <section className="mb-16">
          <h2
            className="text-3xl font-bold mb-8 text-[#111]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Ce en quoi on croit
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                mot: "Le vrai.",
                texte: "On ne ment pas, on n'embellit pas. La réalité telle qu'elle est, même quand elle dérange.",
              },
              {
                mot: "Le brut.",
                texte: "Sans filtre, sans mise en scène. L'info directe, sans détour.",
              },
              {
                mot: "Le mérité.",
                texte: "On met en lumière ceux qui travaillent, qui créent, qui réussissent par le mérite.",
              },
            ].map(({ mot, texte }) => (
              <div key={mot} className="border-t-4 border-[#E53935] pt-5">
                <h3
                  className="text-xl font-black text-[#111] mb-2"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {mot}
                </h3>
                <p className="text-[14px] text-[#424242] leading-relaxed">{texte}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Comment on travaille */}
        <section className="mb-16 bg-[#F5F5F5] p-8">
          <h2
            className="text-2xl font-bold mb-4 text-[#111]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Comment on travaille
          </h2>
          <p className="text-[15px] text-[#424242] leading-relaxed mb-4">
            Réalitte utilise l&apos;intelligence artificielle pour collecter et synthétiser
            l&apos;information en temps réel, à partir de sources vérifiées. Chaque article
            est généré à partir de faits réels, de sources identifiées, et relu
            avant publication.
          </p>
          <p className="text-[15px] text-[#424242] leading-relaxed">
            Ce n&apos;est pas un robot qui écrit n&apos;importe quoi. C&apos;est un outil au service
            d&apos;une vision éditoriale claire : vous informer vite, bien, et honnêtement.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center">
          <p className="text-[15px] text-[#9E9E9E] mb-6">
            Une question ? Une suggestion ? On est là.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3.5 bg-black text-white text-[12px] font-bold tracking-widest uppercase hover:bg-[#E53935] transition-colors"
            >
              Nous contacter
            </Link>
            <Link
              href="/actu"
              className="px-8 py-3.5 border border-black text-black text-[12px] font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
            >
              Lire les articles
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}
