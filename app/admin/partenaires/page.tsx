import { prisma } from "@/lib/prisma";
import PartenairesManager from "./PartenairesManager";

export default async function PartenairesPage() {
  const slots = await prisma.espacePartenaire.findMany({ orderBy: { ordre: "asc" } });
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[22px] font-black tracking-tight uppercase">Espaces Partenaires</h1>
        <p className="text-[13px] text-[#9E9E9E] mt-1">Gérez les 3 emplacements publicitaires de l&apos;accueil</p>
      </div>
      <PartenairesManager slots={slots} />
    </div>
  );
}
