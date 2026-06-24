import { auth } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

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

  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <AdminShell
      role={(session.user as { role?: string }).role || "EDITEUR"}
      user={session.user}
    >
      {children}
    </AdminShell>
  );
}
