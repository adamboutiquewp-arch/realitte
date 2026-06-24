import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";

export const metadata = {
  title: { default: "Admin — Réalitte", template: "%s | Admin Réalitte" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // La page login n'utilise pas ce layout (pas de sidebar/topbar)
  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      <AdminSidebar role={(session.user as { role?: string }).role || "EDITEUR"} />
      <div className="flex-1 flex flex-col min-w-0 ml-0 lg:ml-64">
        <AdminTopBar user={session.user} />
        <main className="flex-1 p-6 md:p-8 min-w-0 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
