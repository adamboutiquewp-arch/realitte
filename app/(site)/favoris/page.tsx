import type { Metadata } from "next";
import FavorisPage from "@/components/site/FavorisPage";

export const metadata: Metadata = {
  title: "Mes favoris — Réalitte",
  description: "Les articles que tu as sauvegardés sur Réalitte.",
};

export default function Page() {
  return <FavorisPage />;
}
