import Link from "next/link";
import { prisma } from "@/lib/prisma";
import InstallButton from "@/components/pwa/InstallButton";

const NAV_COL1 = [
  { label: "Accueil",   href: "/" },
  { label: "Actu",      href: "/actu" },
  { label: "Sport",     href: "/sport" },
  { label: "Politique", href: "/politique" },
];

const NAV_COL2 = [
  { label: "Créateurs",     href: "/createurs" },
  { label: "Entrepreneurs", href: "/entrepreneurs" },
  { label: "À propos",      href: "/a-propos" },
];

const SOCIAL_DEFAULTS = [
  { label: "Instagram", cle: "social_instagram", icon: InstagramIcon },
  { label: "X",         cle: "social_x",         icon: XIcon },
  { label: "TikTok",    cle: "social_tiktok",    icon: TikTokIcon },
  { label: "YouTube",   cle: "social_youtube",   icon: YouTubeIcon },
  { label: "LinkedIn",  cle: "social_linkedin",  icon: LinkedInIcon },
  { label: "Facebook",  cle: "social_facebook",  icon: FacebookIcon },
];

const LEGAL = [
  { label: "CGU",                      href: "/cgu" },
  { label: "Politique de confidentialité", href: "/confidentialite" },
  { label: "Contact",                  href: "/contact" },
];

export default async function Footer() {
  const year = new Date().getFullYear();

  let configs: { cle: string; valeur: string }[] = [];
  try {
    configs = await prisma.siteConfig.findMany({
      where: { cle: { startsWith: "social_" } },
    });
  } catch {
    // Table pas encore créée (prisma db push non lancé)
  }
  const get = (cle: string) => configs.find((c) => c.cle === cle)?.valeur || "";

  const socialLinks = SOCIAL_DEFAULTS
    .map(({ label, cle, icon }) => ({ label, href: get(cle), icon }))
    .filter((s) => s.href);

  return (
    <footer className="bg-black text-white mt-auto">
      {/* Contenu principal */}
      <div className="container-site py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Bloc logo + baseline */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-3">
              <span
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Réalitte<span className="text-[#E53935]">.</span>
              </span>
            </Link>
            <p className="text-[11px] tracking-widest uppercase text-[#9E9E9E] mb-4">
              Le vrai. Le brut. Le mérité.
            </p>
            <p className="text-[13px] text-[#9E9E9E] leading-relaxed">
              Le média de ceux qui veulent comprendre le monde, et ceux qui le changent.
            </p>
          </div>

          {/* Navigation col 1 */}
          <div>
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#E53935] mb-5">
              Navigation
            </h3>
            <ul className="space-y-3">
              {NAV_COL1.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-[13px] text-[#9E9E9E] hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation col 2 */}
          <div>
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#9E9E9E] mb-5 opacity-0 select-none">
              &nbsp;
            </h3>
            <ul className="space-y-3">
              {NAV_COL2.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-[13px] text-[#9E9E9E] hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Réseaux + Mentions légales */}
          <div>
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#E53935] mb-5">
              Suivez-nous
            </h3>
            <div className="flex items-center gap-4 mb-8">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-[#9E9E9E] hover:text-white transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>

            <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#E53935] mb-4">
              Mentions légales
            </h3>
            <ul className="space-y-2">
              {LEGAL.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-[13px] text-[#9E9E9E] hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bas de footer */}
      <div className="border-t border-[#222222]">
        <div className="container-site py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[#424242]">
            © {year} Réalitte. Tous droits réservés.
          </p>
          <InstallButton />
          <p className="text-[11px] text-[#424242]">
            Contenu généré avec assistance IA · Sources vérifiées
          </p>
        </div>
      </div>
    </footer>
  );
}

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function YouTubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}
