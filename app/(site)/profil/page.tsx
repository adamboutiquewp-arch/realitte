import type { Metadata } from "next";
import ProfilClient from "./ProfilClient";

export const metadata: Metadata = { title: "Mon espace — Réalitte" };

export default function ProfilPage() {
  return <ProfilClient />;
}
