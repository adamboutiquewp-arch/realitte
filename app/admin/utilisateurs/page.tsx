import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export const metadata: Metadata = { title: "Utilisateurs" };
export const dynamic = "force-dynamic";

async function createAdmin(formData: FormData) {
  "use server";
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const nom = (formData.get("nom") as string)?.trim();
  const motDePasse = formData.get("motDePasse") as string;
  const role = (formData.get("role") as string) || "EDITEUR";

  if (!email || !motDePasse) return;

  const hash = await bcrypt.hash(motDePasse, 12);
  await prisma.adminUser.create({
    data: { email, nom, motDePasseHash: hash, role: role as "SUPER_ADMIN" | "EDITEUR", actif: true },
  });

  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs");
}

async function toggleActif(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const actif = formData.get("actif") === "true";
  await prisma.adminUser.update({ where: { id }, data: { actif: !actif } });
  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs");
}

const ROLE_STYLE: Record<string, string> = {
  SUPER_ADMIN: "bg-[#111] text-white",
  EDITEUR:     "bg-[#F5F5F5] text-[#666]",
};

export default async function AdminUtilisateursPage() {
  const admins = await prisma.adminUser.findMany({
    orderBy: { dateCreation: "asc" },
    select: {
      id: true,
      email: true,
      nom: true,
      role: true,
      actif: true,
      dateCreation: true,
      derniereConnexion: true,
    },
  });

  return (
    <div className="max-w-[900px]">
      <div className="mb-8">
        <h1 className="text-[22px] font-black text-[#111]">Utilisateurs admin</h1>
        <p className="text-[13px] text-[#999] mt-0.5">{admins.length} compte{admins.length > 1 ? "s" : ""}</p>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-[#F0F0F0]">
          <h2 className="text-[14px] font-bold text-[#111]">Comptes administrateurs</h2>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#F0F0F0]">
              <th className="text-left px-6 py-3 text-[11px] font-bold tracking-wider uppercase text-[#bbb]">Nom</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-[#bbb] hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-[#bbb]">Rôle</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-[#bbb] hidden lg:table-cell">Dernière connexion</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8F8F8]">
            {admins.map((a) => (
              <tr key={a.id} className={`hover:bg-[#FAFAFA] transition-colors ${!a.actif ? "opacity-50" : ""}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
                      {(a.nom || a.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-[#111]">{a.nom || "—"}</p>
                      <p className="text-[11px] text-[#bbb] md:hidden">{a.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-[#666] hidden md:table-cell">{a.email}</td>
                <td className="px-4 py-4">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded ${ROLE_STYLE[a.role]}`}>
                    {a.role === "SUPER_ADMIN" ? "Super Admin" : "Éditeur"}
                  </span>
                </td>
                <td className="px-4 py-4 text-[#bbb] text-[12px] hidden lg:table-cell">
                  {a.derniereConnexion ? formatDate(a.derniereConnexion) : "Jamais"}
                </td>
                <td className="px-4 py-4 text-right">
                  <form action={toggleActif}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="actif" value={String(a.actif)} />
                    <button
                      type="submit"
                      className={`text-[11px] font-medium transition-colors ${
                        a.actif
                          ? "text-[#bbb] hover:text-[#E53935]"
                          : "text-green-600 hover:text-green-700"
                      }`}
                    >
                      {a.actif ? "Désactiver" : "Réactiver"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ajouter un admin */}
      <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F0F0F0]">
          <h2 className="text-[14px] font-bold text-[#111]">Créer un compte</h2>
        </div>
        <form action={createAdmin} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-[#bbb] mb-1.5">Nom complet</label>
              <input
                type="text"
                name="nom"
                placeholder="Marie Dupont"
                className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-[#bbb] mb-1.5">Email *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="marie@realitte.fr"
                className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-[#bbb] mb-1.5">Mot de passe *</label>
              <input
                type="password"
                name="motDePasse"
                required
                minLength={8}
                placeholder="Minimum 8 caractères"
                className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-[#bbb] mb-1.5">Rôle</label>
              <select
                name="role"
                className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-[13px] outline-none focus:border-[#111] bg-white"
              >
                <option value="EDITEUR">Éditeur</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#111] text-white text-[12px] font-bold rounded hover:bg-[#E53935] transition-colors"
          >
            Créer le compte
          </button>
        </form>
      </div>
    </div>
  );
}
