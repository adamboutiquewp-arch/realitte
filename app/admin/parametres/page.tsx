import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Paramètres" };
export const dynamic = "force-dynamic";

const RESEAUX = [
  { cle: "social_instagram", label: "Instagram", placeholder: "https://instagram.com/realitte" },
  { cle: "social_x",         label: "X (Twitter)", placeholder: "https://x.com/realitte" },
  { cle: "social_tiktok",    label: "TikTok",    placeholder: "https://tiktok.com/@realitte" },
  { cle: "social_youtube",   label: "YouTube",   placeholder: "https://youtube.com/@realitte" },
  { cle: "social_linkedin",  label: "LinkedIn",  placeholder: "https://linkedin.com/company/realitte" },
  { cle: "social_facebook",  label: "Facebook",  placeholder: "https://facebook.com/realitte" },
];

async function saveConfig(formData: FormData) {
  "use server";
  for (const { cle } of RESEAUX) {
    const valeur = (formData.get(cle) as string)?.trim() || "";
    await prisma.siteConfig.upsert({
      where: { cle },
      update: { valeur },
      create: { cle, valeur },
    });
  }
  revalidatePath("/");
  revalidatePath("/admin/parametres");
  redirect("/admin/parametres?ok=1");
}

interface PageProps {
  searchParams: Promise<{ ok?: string }>;
}

export default async function ParametresPage({ searchParams }: PageProps) {
  const { ok } = await searchParams;

  const configs = await prisma.siteConfig.findMany();
  const get = (cle: string) => configs.find((c) => c.cle === cle)?.valeur || "";

  return (
    <div className="max-w-[600px]">
      <div className="mb-8">
        <h1 className="text-[22px] font-black text-[#111]">Paramètres du site</h1>
        <p className="text-[13px] text-[#999] mt-0.5">Réseaux sociaux et informations générales</p>
      </div>

      {ok && (
        <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-[13px] font-medium">
          ✓ Paramètres sauvegardés
        </div>
      )}

      <form action={saveConfig} className="bg-white border border-[#E0E0E0] p-6 space-y-5">
        <p className="text-[11px] font-bold tracking-widest uppercase text-[#E53935] mb-2">
          Réseaux sociaux
        </p>

        {RESEAUX.map(({ cle, label, placeholder }) => (
          <div key={cle}>
            <label className="block text-[12px] font-bold text-[#444] mb-1.5">{label}</label>
            <input
              type="url"
              name={cle}
              defaultValue={get(cle)}
              placeholder={placeholder}
              className="w-full px-4 py-2.5 border border-[#E0E0E0] text-[13px] outline-none focus:border-black transition-colors"
            />
          </div>
        ))}

        <div className="pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#111] text-white text-[13px] font-bold hover:bg-[#E53935] transition-colors"
          >
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  );
}
