import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import GenerateurCustom from "@/components/admin/GenerateurCustom";
import PipelineCard from "@/components/admin/PipelineCard";
import ResetSourcesPanel from "./ResetSourcesPanel";

export const metadata: Metadata = { title: "Générer un article" };
export const dynamic = "force-dynamic";

export default async function GenererPage() {
  const [categories, lastLog] = await Promise.all([
    prisma.categorie.findMany({ orderBy: { ordre: "asc" } }),
    prisma.pipelineLog.findFirst({ orderBy: { dateCreation: "desc" } }),
  ]);

  return (
    <div className="max-w-[800px]">
      <div className="mb-8">
        <h1 className="text-[22px] font-black text-[#111]">Générer un article</h1>
        <p className="text-[13px] text-[#999] mt-0.5">
          Génère un article sur un sujet précis avec recherche web en temps réel
        </p>
      </div>

      <div className="mb-8">
        <PipelineCard lastLog={lastLog} />
      </div>

      <GenerateurCustom categories={categories} />
      <ResetSourcesPanel categories={categories} />
    </div>
  );
}
