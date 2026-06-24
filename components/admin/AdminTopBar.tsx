"use client";

import { signOut } from "next-auth/react";
import type { User } from "next-auth";

function getInitials(name?: string | null) {
  if (!name) return "A";
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function AdminTopBar({ user }: { user: User }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="bg-white border-b border-[#EBEBEB] px-6 h-14 flex items-center justify-between flex-shrink-0">
      <p className="text-[12px] text-[#999] capitalize hidden sm:block">{dateStr}</p>
      <span className="sm:hidden font-bold text-[#111]">Admin</span>

      <div className="flex items-center gap-4 ml-auto">
        <div className="text-right hidden md:block">
          <p className="text-[13px] font-semibold text-[#111] leading-none">{user.name}</p>
          <p className="text-[11px] text-[#999] mt-0.5">{user.email}</p>
        </div>

        <div className="w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
          {getInitials(user.name)}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#666] hover:text-[#E53935] border border-[#E8E8E8] hover:border-[#E53935] rounded transition-all"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" x2="9" y1="12" y2="12"/>
          </svg>
          Déconnexion
        </button>
      </div>
    </header>
  );
}
