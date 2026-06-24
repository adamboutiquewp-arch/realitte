import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Entrepreneurs de la semaine" };
export const dynamic = "force-dynamic";

async function createProfil(formData: FormData) {
  "use server";
  const entrepreneurNom      = (formData.get("entrepreneurNom") as string)?.trim();
  const entrepreneurTitre    = (formData.get("entrepreneurTitre") as string)?.trim();
  const entrepreneurBio      = (formData.get("entrepreneurBio") as string)?.trim();
  const entrepreneurCitation = (formData.get("entrepreneurCitation") as string)?.trim();
  const entrepreneurPhoto    = (formData.get("entrepreneurPhoto") as string)?.trim() || null;
  const entrepriseNom        = (formData.get("entrepriseNom") as string)?.trim();
  const entrepriseDescription= (formData.get("entrepriseDescription") as string)?.trim();
  const entrepriseLogo       = (formData.get("entrepriseLogo") as string)?.trim() || null;
  const entrepriseSite       = (formData.get("entrepriseSite") as string)?.trim() || null;
  const semaineDu            = new Date(formData.get("semaineDu") as string);

  if (!entrepreneurNom || !entrepriseNom || !entrepreneurBio || !entrepreneurCitation || !entrepriseDescription) return;

  await prisma.entrepreneurSemaine.create({
    data: {
      entrepreneurNom, entrepreneurTitre: entrepreneurTitre || "", entrepreneurBio,
      entrepreneurCitation, entrepreneurPhoto, entrepriseNom, entrepriseDescription,
      entrepriseLogo, entrepriseSite, semaineDu, actif: true,
    },
  });

  revalidatePath("/admin/entrepreneurs");
  revalidatePath("/");
  revalidatePath("/entrepreneurs");
  redirect("/admin/entrepreneurs");
}

async function toggleActif(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const actif = formData.get("actif") === "true";
  await prisma.entrepreneurSemaine.update({ where: { id }, data: { actif: !actif } });
  revalidatePath("/admin/entrepreneurs");
  revalidatePath("/");
  revalidatePath("/entrepreneurs");
  redirect("/admin/entrepreneurs");
}

async function deleteProfil(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await prisma.entrepreneurSemaine.delete({ where: { id } });
  revalidatePath("/admin/entrepreneurs");
  revalidatePath("/");
  revalidatePath("/entrepreneurs");
  redirect("/admin/entrepreneurs");
}

const inputClass = "w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] transition-colors";
const labelClass = "block text-[10px] font-bold tracking-wider uppercase text-[#bbb] mb-1.5";

export default async function AdminEntrepreneursPage() {
  const profils = await prisma.entrepreneurSemaine.findMany({
    orderBy: { semaineDu: "desc" },
  });

  const formatSemaine = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));

  // Date par défaut = lundi de la semaine en cours
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = (day === 0 ? -6 : 1 - day);
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  const defaultDate = monday.toISOString().split("T")[0];

  return (
    <div className="max-w-[900px]">
      <div className="mb-8">
        <h1 className="text-[22px] font-black text-[#111]">Entrepreneurs de la semaine</h1>
        <p className="text-[13px] text-[#999] mt-0.5">Gérez les profils hebdomadaires affichés sur la home et la page /entrepreneurs</p>
      </div>

      {/* Liste des profils */}
      <div className="space-y-4 mb-10">
        {profils.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#EBEBEB] py-12 text-center">
            <p className="text-[14px] text-[#bbb]">Aucun profil. Créez-en un ci-dessous.</p>
          </div>
        ) : (
          profils.map((p) => (
            <div key={p.id} className={`bg-white rounded-xl border overflow-hidden ${p.actif ? "border-[#EBEBEB]" : "border-[#F0F0F0] opacity-60"}`}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F5F5]">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`w-2 h-2 rounded-full ${p.actif ? "bg-green-500" : "bg-[#ccc]"}`} />
                  <span className="font-bold text-[#111]">{p.entrepreneurNom}</span>
                  <span className="text-[12px] text-[#999]">•</span>
                  <span className="text-[12px] text-[#666]">{p.entrepriseNom}</span>
                  <span className="text-[11px] text-[#bbb] font-mono bg-[#F5F5F5] px-2 py-0.5 rounded">
                    Semaine du {formatSemaine(p.semaineDu)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <form action={toggleActif}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="actif" value={String(p.actif)} />
                    <button type="submit" className={`px-3 py-1.5 text-[11px] font-bold rounded transition-all ${p.actif ? "bg-[#F5F5F5] text-[#666] hover:bg-red-50 hover:text-red-600" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                      {p.actif ? "Désactiver" : "Activer"}
                    </button>
                  </form>
                  <form action={deleteProfil}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="px-3 py-1.5 text-[11px] font-bold rounded bg-[#F5F5F5] text-[#999] hover:bg-red-50 hover:text-red-600 transition-all">
                      Supprimer
                    </button>
                  </form>
                </div>
              </div>
              <div className="px-6 py-4 grid grid-cols-2 gap-x-8 gap-y-1 text-[12px] text-[#666]">
                <p><span className="font-bold text-[#999]">Titre :</span> {p.entrepreneurTitre}</p>
                <p><span className="font-bold text-[#999]">Site :</span> {p.entrepriseSite || "—"}</p>
                <p className="col-span-2 line-clamp-1"><span className="font-bold text-[#999]">Citation :</span> {p.entrepreneurCitation}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulaire de création */}
      <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F0F0F0]">
          <h2 className="text-[14px] font-bold text-[#111]">Ajouter un profil de la semaine</h2>
        </div>
        <form action={createProfil} className="p-6 space-y-6">

          {/* Semaine */}
          <div>
            <label className={labelClass}>Semaine du (lundi) *</label>
            <input type="date" name="semaineDu" defaultValue={defaultDate} required className={inputClass} />
          </div>

          {/* Entrepreneur */}
          <div>
            <p className="text-[11px] font-black tracking-[0.15em] uppercase text-[#E53935] mb-3">L'entrepreneur</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom complet *</label>
                <input type="text" name="entrepreneurNom" required placeholder="Jean Dupont" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Titre / Fonction *</label>
                <input type="text" name="entrepreneurTitre" required placeholder="CEO & Fondateur" className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Citation inspirante *</label>
                <input type="text" name="entrepreneurCitation" required placeholder="Ma philosophie en une phrase..." className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Biographie *</label>
                <textarea name="entrepreneurBio" required rows={4} placeholder="Parcours, réussites, vision..." className={`${inputClass} resize-none`} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>URL photo (portrait)</label>
                <input type="url" name="entrepreneurPhoto" placeholder="https://..." className={inputClass} />
              </div>
            </div>
          </div>

          {/* Entreprise */}
          <div>
            <p className="text-[11px] font-black tracking-[0.15em] uppercase text-[#E53935] mb-3">L'entreprise</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom de l'entreprise *</label>
                <input type="text" name="entrepriseNom" required placeholder="Ma Startup SAS" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Site web</label>
                <input type="url" name="entrepriseSite" placeholder="https://..." className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Description de l'entreprise *</label>
                <textarea name="entrepriseDescription" required rows={3} placeholder="Ce que fait l'entreprise, son marché, son impact..." className={`${inputClass} resize-none`} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>URL logo</label>
                <input type="url" name="entrepriseLogo" placeholder="https://..." className={inputClass} />
              </div>
            </div>
          </div>

          <button type="submit" className="px-6 py-2.5 bg-[#111] text-white text-[12px] font-bold rounded hover:bg-[#E53935] transition-colors">
            Publier le profil
          </button>
        </form>
      </div>
    </div>
  );
}
