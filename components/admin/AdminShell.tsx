"use client";

import { useState } from "react";
import type { User } from "next-auth";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";

export default function AdminShell({
  children,
  role,
  user,
}: {
  children: React.ReactNode;
  role: string;
  user: User;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Sidebar */}
      <AdminSidebar role={role} open={open} />

      {/* Overlay mobile quand sidebar ouverte */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Contenu principal */}
      <div
        className="flex flex-col min-h-screen transition-[margin] duration-300 ease-in-out"
        style={{ marginLeft: open ? 256 : 0 }}
      >
        <AdminTopBar
          user={user}
          sidebarOpen={open}
          onToggle={() => setOpen((v) => !v)}
        />
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
