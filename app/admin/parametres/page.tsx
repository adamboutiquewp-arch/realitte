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

const FACEBOOK_API = [
  { cle: "facebook_page_id",    label: "Page ID Facebook",    placeholder: "123456789012345", type: "text" },
  { cle: "facebook_page_token", label: "Page Access Token Facebook", placeholder: "EAABs…", type: "password" },
];

async function saveConfig(formData: FormData) {
  "use server";
  const allFields = [...RESEAUX, ...FACEBOOK_API];
  for (const { cle } of allFields) {
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

        <hr className="border-[#E0E0E0]" />

        <p className="text-[11px] font-bold tracking-widest uppercase text-[#1877F2] mt-2">
          Publication automatique Facebook
        </p>
        <p className="text-[12px] text-[#999] -mt-3">
          Permet de poster les articles directement sur la page Facebook depuis l&apos;admin.
        </p>

        {FACEBOOK_API.map(({ cle, label, placeholder, type }) => (
          <div key={cle}>
            <label className="block text-[12px] font-bold text-[#444] mb-1.5">{label}</label>
            <input
              type={type}
              name={cle}
              defaultValue={get(cle)}
              placeholder={placeholder}
              autoComplete="off"
              className="w-full px-4 py-2.5 border border-[#E0E0E0] text-[13px] outline-none focus:border-[#1877F2] transition-colors font-mono"
            />
          </div>
        ))}

        <div className="p-3 bg-[#E7F3FF] border border-[#C3D9F5] text-[12px] text-[#1877F2] -mt-2">
          <strong>Comment obtenir le token ?</strong> Meta for Developers → votre app → Graph API Explorer → sélectionner la page → générer un Page Access Token permanent (voir la procédure dans l&apos;admin).
        </div>

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
