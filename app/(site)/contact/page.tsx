import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez l'équipe Réalitte pour toute question ou collaboration.",
};

export default function ContactPage() {
  return (
    <div className="container-site py-16 max-w-2xl mx-auto">
      <h1
        className="text-4xl font-bold mb-2"
        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
      >
        Contact
      </h1>
      <p className="text-[#9E9E9E] text-sm mb-10">On vous répond sous 48h.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

        <div className="bg-[#F5F5F5] p-6">
          <div className="w-8 h-[3px] bg-[#E53935] mb-4" />
          <h2 className="text-[13px] font-bold tracking-widest uppercase text-[#111] mb-2">
            Rédaction
          </h2>
          <p className="text-[14px] text-[#424242] mb-3">
            Suggestion d&apos;article, correction, partenariat éditorial.
          </p>
          <a
            href="mailto:redaction@realitte.com"
            className="text-[#E53935] text-[14px] font-medium hover:underline"
          >
            redaction@realitte.com
          </a>
        </div>

        <div className="bg-[#F5F5F5] p-6">
          <div className="w-8 h-[3px] bg-[#E53935] mb-4" />
          <h2 className="text-[13px] font-bold tracking-widest uppercase text-[#111] mb-2">
            Publicité & Partenariats
          </h2>
          <p className="text-[14px] text-[#424242] mb-3">
            Espaces publicitaires, collaborations, sponsors.
          </p>
          <a
            href="mailto:contact@realitte.com"
            className="text-[#E53935] text-[14px] font-medium hover:underline"
          >
            contact@realitte.com
          </a>
        </div>

        <div className="bg-[#F5F5F5] p-6">
          <div className="w-8 h-[3px] bg-[#E53935] mb-4" />
          <h2 className="text-[13px] font-bold tracking-widest uppercase text-[#111] mb-2">
            Données personnelles
          </h2>
          <p className="text-[14px] text-[#424242] mb-3">
            Droit d&apos;accès, rectification, suppression (RGPD).
          </p>
          <a
            href="mailto:contact@realitte.com"
            className="text-[#E53935] text-[14px] font-medium hover:underline"
          >
            contact@realitte.com
          </a>
        </div>

        <div className="bg-[#F5F5F5] p-6">
          <div className="w-8 h-[3px] bg-[#E53935] mb-4" />
          <h2 className="text-[13px] font-bold tracking-widest uppercase text-[#111] mb-2">
            Général
          </h2>
          <p className="text-[14px] text-[#424242] mb-3">
            Toute autre demande.
          </p>
          <a
            href="mailto:contact@realitte.com"
            className="text-[#E53935] text-[14px] font-medium hover:underline"
          >
            contact@realitte.com
          </a>
        </div>

      </div>

      <div className="border-t border-[#E0E0E0] pt-8">
        <p className="text-[13px] text-[#9E9E9E] leading-relaxed">
          <strong className="text-[#111]">Réalitte</strong> est un média d&apos;information en ligne indépendant.<br />
          Nous nous engageons à répondre à toutes les demandes dans un délai de 48 heures ouvrées.
        </p>
      </div>
    </div>
  );
}
