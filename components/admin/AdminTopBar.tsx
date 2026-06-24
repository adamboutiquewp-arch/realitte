"use client";

import { signOut } from "next-auth/react";
import type { User } from "next-auth";

export default function AdminTopBar({ user }: { user: User }) {
  return (
    <header className="bg-white border-b border-[#E0E0E0] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="font-bold text-[#111111]">Admin</span>
      </div>

      <div className="flex items-center gap-5 ml-auto">
        <div className="text-right hidden sm:block">
          <p className="text-[13px] font-semibold text-[#111111]">{user.name}</p>
          <p className="text-[11px] text-[#9E9E9E]">{user.email}</p>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="px-4 py-2 border border-[#E0E0E0] text-[12px] font-bold tracking-wider uppercase text-[#424242] hover:border-[#E53935] hover:text-[#E53935] transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
