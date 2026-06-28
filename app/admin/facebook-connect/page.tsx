import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FacebookConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; connected?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const params = await searchParams;
  const error = params.error;

  const appId = process.env.FACEBOOK_APP_ID;
  const scopes = [
    "pages_show_list",
    "pages_manage_posts",
    "pages_read_engagement",
    "instagram_basic",
    "instagram_content_publish",
  ].join(",");

  const oauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=https://www.realitte.com/api/admin/facebook-callback&scope=${scopes}&response_type=code`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🔗</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Connexion Facebook & Instagram</h1>
        <p className="text-sm text-gray-500 mb-6">
          Clique sur le bouton ci-dessous pour connecter ta page Facebook et ton compte Instagram.
          Tu seras redirigé vers Facebook pour autoriser l&apos;accès.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            ❌ {decodeURIComponent(error)}
          </div>
        )}

        <a
          href={oauthUrl}
          className="inline-block w-full py-3 px-6 bg-[#1877F2] text-white font-bold rounded-lg hover:bg-[#166fe5] transition-colors text-sm"
        >
          Connecter avec Facebook
        </a>

        <p className="mt-4 text-xs text-gray-400">
          Permissions demandées : gestion de page, publication Instagram
        </p>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <a href="/api/admin/diagnostic-meta" className="text-xs text-blue-600 hover:underline">
            → Vérifier la configuration actuelle
          </a>
        </div>
      </div>
    </div>
  );
}
