import HeaderWrapper from "@/components/layout/HeaderWrapper";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import InstallBanner from "@/components/pwa/InstallBanner";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeaderWrapper />
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
      <Footer />
      <BottomNav />
      <InstallBanner />
    </>
  );
}
