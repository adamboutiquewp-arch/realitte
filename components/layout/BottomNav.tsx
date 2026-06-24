"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Accueil",    href: "/",          icon: HomeIcon },
  { label: "Explorer",   href: "/explorer",  icon: ExploreIcon },
  { label: "Favoris",    href: "/favoris",   icon: HeartIcon },
  { label: "Newsletter", href: "/newsletter",icon: MailIcon },
  { label: "Profil",     href: "/profil",    icon: UserIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E0E0E0] flex sm:hidden bottom-nav-safe"
      aria-label="Navigation mobile"
    >
      {NAV.map(({ label, href, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-1 transition-colors"
          >
            <Icon size={22} active={active} />
            <span
              className={`text-[9px] font-semibold tracking-wider uppercase ${
                active ? "text-[#E53935]" : "text-[#9E9E9E]"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function HomeIcon({ size = 22, active }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "#E53935" : "none"} stroke={active ? "#E53935" : "#9E9E9E"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function ExploreIcon({ size = 22, active }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? "#E53935" : "#9E9E9E"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function HeartIcon({ size = 22, active }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "#E53935" : "none"} stroke={active ? "#E53935" : "#9E9E9E"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function MailIcon({ size = 22, active }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? "#E53935" : "#9E9E9E"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function UserIcon({ size = 22, active }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? "#E53935" : "#9E9E9E"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
