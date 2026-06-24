"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.FC<{ className?: string }>;
  superAdminOnly?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Contenu",
    items: [
      { label: "Tableau de bord", href: "/admin",              icon: IconDashboard },
      { label: "Articles",        href: "/admin/articles",     icon: IconArticle },
      { label: "Catégories",      href: "/admin/categories",   icon: IconTag },
    ],
  },
  {
    label: "Audience",
    items: [
      { label: "Commentaires",    href: "/admin/commentaires", icon: IconComment },
      { label: "Newsletter",      href: "/admin/newsletter",   icon: IconMail },
    ],
  },
  {
    label: "Monétisation",
    items: [
      { label: "Publicité",       href: "/admin/pub",          icon: IconAd },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Utilisateurs",    href: "/admin/utilisateurs", icon: IconUsers, superAdminOnly: true },
    ],
  },
];

export default function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const isSuperAdmin = role === "SUPER_ADMIN";

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 bg-[#0F0F0F] z-40 select-none">
      {/* Logo */}
      <div className="px-6 pt-7 pb-6 border-b border-white/[0.08]">
        <Link href="/" target="_blank" className="block">
          <span
            className="text-[22px] font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Réalitte<span className="text-[#E53935]">.</span>
          </span>
          <span className="block text-[10px] text-[#555] tracking-[0.18em] uppercase mt-0.5">
            Back-office
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.superAdminOnly || isSuperAdmin
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-6">
              <p className="px-3 mb-1.5 text-[10px] font-bold tracking-[0.15em] uppercase text-[#444]">
                {group.label}
              </p>
              {visibleItems.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-[13px] font-medium transition-all
                      ${active
                        ? "bg-white/[0.1] text-white"
                        : "text-[#777] hover:text-[#bbb] hover:bg-white/[0.05]"
                      }
                    `}
                  >
                    <Icon className={`w-[17px] h-[17px] flex-shrink-0 ${active ? "text-[#E53935]" : ""}`} />
                    <span className="flex-1">{label}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-[#E53935] flex-shrink-0" />}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.08]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-[#555] hover:text-[#bbb] hover:bg-white/[0.05] transition-all"
        >
          <IconExternal className="w-[14px] h-[14px]" />
          Voir le site
        </Link>
      </div>
    </aside>
  );
}

// ── Icônes SVG ────────────────────────────────────────────────────────────────

function IconDashboard({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1.5"/>
      <rect width="7" height="5" x="14" y="3" rx="1.5"/>
      <rect width="7" height="9" x="14" y="12" rx="1.5"/>
      <rect width="7" height="5" x="3" y="16" rx="1.5"/>
    </svg>
  );
}

function IconArticle({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" x2="8" y1="13" y2="13"/>
      <line x1="16" x2="8" y1="17" y2="17"/>
      <line x1="10" x2="8" y1="9" y2="9"/>
    </svg>
  );
}

function IconTag({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" x2="7.01" y1="7" y2="7"/>
    </svg>
  );
}

function IconComment({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function IconMail({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function IconAd({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2"/>
      <path d="M9 9h6M9 12h4M9 15h2"/>
    </svg>
  );
}

function IconUsers({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function IconExternal({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" x2="21" y1="14" y2="3"/>
    </svg>
  );
}
