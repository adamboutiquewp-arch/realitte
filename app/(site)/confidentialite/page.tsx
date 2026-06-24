import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et protection des données personnelles de Réalitte.",
};

export default function ConfidentialitePage() {
  return (
    <div className="container-site py-16 max-w-3xl mx-auto">
      <h1
        className="text-4xl font-bold mb-2"
        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
      >
        Politique de confidentialité
      </h1>
      <p className="text-[#9E9E9E] text-sm mb-10">Dernière mise à jour : juin 2025</p>

      <div className="space-y-8 text-[15px] leading-relaxed text-[#424242]">

        <section>
          <h2 className="text-xl font-bold text-[#111] mb-3">1. Responsable du traitement</h2>
          <p>
            Le responsable du traitement des données personnelles collectées sur <strong>realitte.com</strong> est l&apos;équipe Réalitte, joignable à : <a href="mailto:contact@realitte.com" className="text-[#E53935] hover:underline">contact@realitte.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#111] mb-3">2. Données collectées</h2>
          <p>Nous collectons les données suivantes :</p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li><strong>Adresse email</strong> : lors de l&apos;inscription à la newsletter</li>
            <li><strong>Données de navigation</strong> : via des cookies analytiques anonymes</li>
          </ul>
          <p className="mt-3">Nous ne collectons aucune donnée sensible (carte bancaire, données de santé, etc.).</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#111] mb-3">3. Utilisation des données</h2>
          <p>Les données collectées sont utilisées pour :</p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li>Envoyer la newsletter hebdomadaire (avec consentement)</li>
            <li>Améliorer l&apos;expérience utilisateur du site</li>
            <li>Analyser l&apos;audience de façon anonyme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#111] mb-3">4. Partage des données</h2>
          <p>
            Vos données ne sont jamais vendues à des tiers. Elles peuvent être transmises à nos prestataires techniques (Brevo pour l&apos;envoi d&apos;emails) dans le cadre strict de leurs services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#111] mb-3">5. Conservation des données</h2>
          <p>
            Votre adresse email est conservée tant que vous êtes abonné(e) à la newsletter. Vous pouvez vous désinscrire à tout moment via le lien présent dans chaque email.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#111] mb-3">6. Vos droits (RGPD)</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li><strong>Droit d&apos;accès</strong> : connaître les données que nous avons sur vous</li>
            <li><strong>Droit de rectification</strong> : corriger vos données</li>
            <li><strong>Droit à l&apos;effacement</strong> : supprimer vos données</li>
            <li><strong>Droit d&apos;opposition</strong> : vous opposer au traitement</li>
          </ul>
          <p className="mt-3">
            Pour exercer ces droits : <a href="mailto:contact@realitte.com" className="text-[#E53935] hover:underline">contact@realitte.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#111] mb-3">7. Cookies</h2>
          <p>
            Le site utilise des cookies techniques nécessaires à son fonctionnement. Aucun cookie publicitaire n&apos;est déposé sans votre consentement.
          </p>
        </section>

      </div>
    </div>
  );
}
