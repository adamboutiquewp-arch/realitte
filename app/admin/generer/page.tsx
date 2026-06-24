import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import GenerateurCustom from "@/components/admin/GenerateurCustom";
import PipelineTrigger from "@/components/admin/PipelineTrigger";

export const metadata: Metadata = { title: "Générer un article" };
export const dynamic = "force-dynamic";

export default async function GenererPage() {
  const categories = await prisma.categorie.findMany({ orderBy: { ordre: "asc" } });
  return (
    <div className="max-w-[800px]">
      <div className="mb-8">
        <h1 className="text-[22px] font-black text-[#111]">Générer un article</h1>
        <p className="text-[13px] text-[#999] mt-0.5">
          Lance la pipeline RSS ou génère un article sur un sujet précis
        </p>
      </div>
      <PipelineTrigger categories={categories} />
      <GenerateurCustom categories={categories} />
    </div>
  );
}
