"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import SearchModal from "./SearchModal";

const NAV_ITEMS = [
  { label: "Actu",          href: "/actu",          couleur: "#E53935" },
  { label: "Sport",         href: "/sport",         couleur: "#1565C0" },
  { label: "Politique",     href: "/politique",     couleur: "#6A1B9A" },
  { label: "Créateurs",     href: "/createurs",     couleur: "#7C3AED" },
  { label: "Entrepreneurs", href: "/entrepreneurs", couleur: "#C9A84C" },
];

const NAV_GROUPES = [
  {
    titre: "Rubriques",
    items: [
      { label: "Actu",          href: "/actu",          couleur: "#E53935" },
      { label: "Sport",         href: "/sport",         couleur: "#1565C0" },
      { label: "Politique",     href: "/politique",     couleur: "#6A1B9A" },
      { label: "Créateurs",     href: "/createurs",     couleur: "#7C3AED" },
      { label: "Entrepreneurs", href: "/entrepreneurs", couleur: "#C9A84C" },
    ],
  },
];

const ICON_MAP: Record<string, ({ size }: { size?: number }) => React.ReactElement> = {
  Instagram: InstagramIcon,
  X: XIcon,
  TikTok: TikTokIcon,
  YouTube: YouTubeIcon,
  LinkedIn: LinkedInIcon,
  Facebook: FacebookIcon,
};

interface SocialLink { label: string; href: string; }

export default function Header({ socialLinks = [] }: { socialLinks?: SocialLink[] }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* ── Bandeau supérieur noir ── */}
      <div className="bg-black text-white hidden md:block">
        <div className="container-site flex items-center justify-between h-9">
          <span className="text-[11px] tracking-widest uppercase text-[#9E9E9E]">
            Transparence. Vérité. Réussite.
          </span>
          <div className="flex items-center gap-4">
            {socialLinks.map(({ label, href }) => {
              const Icon = ICON_MAP[label];
              if (!Icon) return null;
              return (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-[#9E9E9E] hover:text-white transition-colors">
                  <Icon size={15} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Header principal ── */}
      <header
        className={`sticky top-0 z-50 bg-white border-b transition-shadow duration-200 ${
          scrolled ? "shadow-md border-[#E0E0E0]" : "border-[#E0E0E0]"
        }`}
      >
        <div className="container-site">
          <div className="flex items-center justify-between h-14 md:h-16">

            {/* Mobile : hamburger */}
            <button
              className="md:hidden flex flex-col gap-[5px] p-2 -ml-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              <span className={`block w-6 h-[2px] bg-black transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block w-6 h-[2px] bg-black transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-[2px] bg-black transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0 md:flex-none"
              aria-label="Réalitte — accueil"
            >
              <div className="flex flex-col items-start leading-none">
                <span
                  className="text-2xl md:text-3xl font-bold tracking-tight text-black"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  Réalitte
                  <span className="text-[#E53935]">.</span>
                </span>
                <span className="hidden md:block text-[9px] tracking-[0.2em] uppercase text-[#9E9E9E] mt-0.5">
                  Le vrai. Le brut. Le mérité.
                </span>
              </div>
            </Link>

            {/* Desktop : navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Navigation principale">
              {NAV_ITEMS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-[13px] font-bold tracking-widest uppercase transition-colors duration-150 pb-0.5 border-b-2 ${
                    isActive(href)
                      ? "text-black border-[#E53935]"
                      : "text-[#424242] border-transparent hover:text-black hover:border-[#E53935]"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Droite : recherche + S'abonner */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Rechercher"
                className="p-2 text-[#424242] hover:text-black transition-colors"
              >
                <SearchIcon size={20} />
              </button>
              <Link
                href="/newsletter"
                className="hidden md:inline-flex items-center px-5 py-2.5 bg-black text-white text-[12px] font-bold tracking-widest uppercase hover:bg-[#E53935] transition-colors duration-200"
              >
                S&apos;abonner
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile : nav catégories scrollable — style pills */}
        <div className="md:hidden border-t border-[#F0F0F0] overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 px-4 py-2.5 min-w-max">
            {NAV_ITEMS.map(({ label, href, couleur }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all"
                  style={
                    active
                      ? { backgroundColor: couleur, color: "#fff" }
                      : { backgroundColor: `${couleur}14`, color: couleur }
                  }
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile : menu latéral */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl md:hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#E0E0E0]">
              <span className="text-xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Réalitte<span className="text-[#E53935]">.</span>
              </span>
              <button onClick={() => setMenuOpen(false)} aria-label="Fermer le menu">
                <CloseIcon size={20} />
              </button>
            </div>
            <nav className="flex-1 py-2 overflow-y-auto">
              {NAV_GROUPES.map((groupe) => (
                <div key={groupe.titre} className="mb-1">
                  <p className="px-6 pt-4 pb-2 text-[10px] font-black tracking-[0.2em] uppercase text-[#bbb]">
                    {groupe.titre}
                  </p>
                  {groupe.items.map(({ label, href, couleur }) => {
                    const active = isActive(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-4 px-6 py-6 text-[20px] font-bold transition-all border-l-4 ${
                          active
                            ? "border-[#E53935] text-[#E53935] bg-[#FFF5F5] pl-5"
                            : "border-transparent text-[#111] hover:text-[#E53935]"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: active ? "#E53935" : couleur }}
                        />
                        {label}
                      </Link>
                    );
                  })}
                  <div className="mx-6 border-b border-[#F0F0F0]" />
                </div>
              ))}
            </nav>
            <div className="p-5 border-t border-[#E0E0E0]">
              <div className="flex gap-4 mb-4">
                {socialLinks.map(({ label, href }) => {
                  const Icon = ICON_MAP[label];
                  if (!Icon) return null;
                  return (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-[#9E9E9E] hover:text-black transition-colors">
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
              <Link
                href="/newsletter"
                className="block text-center py-3 bg-black text-white text-[12px] font-bold tracking-widest uppercase hover:bg-[#E53935] transition-colors"
              >
                S&apos;abonner
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Modal de recherche */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

// ─── Icônes SVG inline ───────────────────────────────────

function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function CloseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function YouTubeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}
