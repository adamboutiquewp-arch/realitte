import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "Conditions générales d'utilisation du site Réalitte.",
};

export default function CGUPage() {
  return (
    <div className="container-site py-16 max-w-3xl mx-auto">
      <h1
        className="text-4xl font-bold mb-2"
        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
      >
        Conditions Générales d&apos;Utilisation
      </h1>
      <p className="text-[#9E9E9E] text-sm mb-10">Dernière mise à jour : juin 2025</p>

      <div className="prose prose-neutral max-w-none space-y-8 text-[15px] leading-relaxed text-[#424242]">

        <section>
          <h2 className="text-xl font-bold text-[#111] mb-3">1. Présentation du site</h2>
          <p>
            Le site <strong>Réalitte</strong> (accessible à l&apos;adresse <strong>realitte.com</strong>) est un média d&apos;information en ligne proposant des articles d&apos;actualité dans les domaines de l&apos;actu, du sport, de la politique, des créateurs de contenu et des entrepreneurs.
          </p>
          <p className="mt-3">
            Une partie du contenu est générée avec l&apos;assistance de l&apos;intelligence artificielle, à partir de sources vérifiées. Chaque article indique son mode de production.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#111] mb-3">2. Accès au site</h2>
          <p>
            L&apos;accès au site est gratuit et ouvert à tout utilisateur disposant d&apos;une connexion Internet. Réalitte se réserve le droit de modifier, suspendre ou interrompre l&apos;accès au site à tout moment, sans préavis.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#111] mb-3">3. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus présents sur Réalitte (textes, images, logos, mise en page) sont protégés par le droit de la propriété intellectuelle. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#111] mb-3">4. Responsabilité</h2>
          <p>
            Réalitte s&apos;efforce de proposer des informations exactes et à jour. Cependant, le site ne saurait être tenu responsable des erreurs, omissions ou résultats obtenus suite à l&apos;utilisation de ces informations.
          </p>
          <p className="mt-3">
            Les articles générés par IA sont relus et validés par notre équipe éditoriale avant publication.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#111] mb-3">5. Liens externes</h2>
          <p>
            Le site peut contenir des liens vers des sites tiers. Réalitte n&apos;est pas responsable du contenu de ces sites externes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#111] mb-3">6. Droit applicable</h2>
          <p>
            Les présentes CGU sont soumises au droit français. Tout litige relatif à leur interprétation relèvera de la compétence des tribunaux français.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#111] mb-3">7. Contact</h2>
          <p>
            Pour toute question relative aux présentes CGU, contactez-nous à l&apos;adresse : <a href="mailto:contact@realitte.com" className="text-[#E53935] hover:underline">contact@realitte.com</a>
          </p>
        </section>

      </div>
    </div>
  );
}
