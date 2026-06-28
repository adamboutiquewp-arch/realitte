import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FB_API = "https://graph.facebook.com/v19.0";

function html(checks: { label: string; ok: boolean; detail: string }[]) {
  const rows = checks
    .map(
      (c) => `
    <tr>
      <td style="padding:10px 16px;font-size:15px;">${c.ok ? "✅" : "❌"}</td>
      <td style="padding:10px 16px;font-weight:600;font-size:14px;color:#111;">${c.label}</td>
      <td style="padding:10px 16px;font-size:13px;color:${c.ok ? "#16a34a" : "#dc2626"};">${c.detail}</td>
    </tr>`
    )
    .join("");

  const allOk = checks.every((c) => c.ok);
  const banner = allOk
    ? `<div style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:14px 20px;margin-bottom:24px;color:#166534;font-weight:700;font-size:15px;">✅ Tout est correctement configuré — publication automatique opérationnelle</div>`
    : `<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:14px 20px;margin-bottom:24px;color:#991b1b;font-weight:700;font-size:15px;">❌ Des problèmes ont été détectés — vérifiez les éléments en rouge</div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Diagnostic Meta — Realitte</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;background:#f9fafb;}
  h1{font-size:22px;font-weight:800;color:#111;margin-bottom:4px;}
  p.sub{color:#6b7280;font-size:13px;margin-bottom:24px;}
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,.08);overflow:hidden;}
  tr{border-bottom:1px solid #f3f4f6;}
  tr:last-child{border-bottom:none;}
  tr:hover{background:#fafafa;}
  th{padding:10px 16px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;background:#f9fafb;text-align:left;}
  a{color:#2563eb;font-size:13px;}
  .refresh{display:inline-block;margin-top:20px;padding:9px 18px;background:#111;color:#fff;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;}
</style>
</head>
<body>
  <h1>🔍 Diagnostic Meta — Realitte</h1>
  <p class="sub">Vérifie la configuration Facebook & Instagram pour la publication automatique</p>
  ${banner}
  <table>
    <thead><tr><th>Statut</th><th>Vérification</th><th>Détail</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <a href="/api/admin/diagnostic-meta" class="refresh">🔄 Relancer le diagnostic</a>
  <p style="margin-top:16px;font-size:12px;color:#9ca3af;">Pour modifier les clés : <a href="/admin/parametres">/admin/parametres</a></p>
</body>
</html>`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Non autorisé — connecte-toi d'abord à /admin/login", { status: 401 });
  }

  const checks: { label: string; ok: boolean; detail: string }[] = [];

  // Charge les configs depuis la DB
  const configs = await prisma.siteConfig.findMany({
    where: { cle: { in: ["facebook_page_id", "facebook_page_token", "instagram_user_id"] } },
  });
  const get = (cle: string) => configs.find((c) => c.cle === cle)?.valeur || "";

  const pageId    = get("facebook_page_id");
  const pageToken = get("facebook_page_token");
  const igUserId  = get("instagram_user_id");
  const cronSecret = process.env.CRON_SECRET || "";

  // 1. CRON_SECRET configuré
  checks.push({
    label: "CRON_SECRET (variable Vercel)",
    ok: cronSecret.length > 0,
    detail: cronSecret.length > 0 ? "Variable définie sur Vercel" : "Non définie — le cron automatique ne fonctionnera pas",
  });

  // 2. Facebook Page ID
  checks.push({
    label: "facebook_page_id",
    ok: pageId.length > 0,
    detail: pageId.length > 0 ? `ID configuré : ${pageId}` : "Non configuré dans /admin/parametres",
  });

  // 3. Facebook Page Token
  checks.push({
    label: "facebook_page_token",
    ok: pageToken.length > 0,
    detail: pageToken.length > 0 ? `Token présent (${pageToken.length} caractères)` : "Non configuré dans /admin/parametres",
  });

  // 4. Instagram User ID
  checks.push({
    label: "instagram_user_id",
    ok: igUserId.length > 0,
    detail: igUserId.length > 0 ? `ID configuré : ${igUserId}` : "Non configuré dans /admin/parametres",
  });

  // 5. Test token Facebook (appel API réel)
  if (pageToken.length > 0) {
    try {
      const res = await fetch(`${FB_API}/me?access_token=${pageToken}&fields=id,name`);
      const data = await res.json();
      if (data.error) {
        checks.push({ label: "Token Facebook — validité", ok: false, detail: `Token invalide : ${data.error.message}` });
      } else {
        checks.push({ label: "Token Facebook — validité", ok: true, detail: `Connecté en tant que : ${data.name} (${data.id})` });
      }
    } catch {
      checks.push({ label: "Token Facebook — validité", ok: false, detail: "Impossible de contacter l'API Facebook" });
    }
  } else {
    checks.push({ label: "Token Facebook — validité", ok: false, detail: "Token manquant — test impossible" });
  }

  // 6. Droits du Page Access Token (via le champ tasks de la page)
  if (pageId && pageToken) {
    try {
      const res = await fetch(`${FB_API}/${pageId}?fields=tasks&access_token=${pageToken}`);
      const data = await res.json();
      if (data.error) {
        checks.push({ label: "Droits de publication (Page Token)", ok: false, detail: data.error.message });
      } else {
        const tasks: string[] = data.tasks || [];
        const canPublish = tasks.includes("CREATE_CONTENT") || tasks.includes("MANAGE");
        checks.push({
          label: "Droits de publication (Page Token)",
          ok: canPublish,
          detail: canPublish
            ? `Droits OK : ${tasks.join(", ")}`
            : `Droits insuffisants pour publier — tâches disponibles : ${tasks.join(", ") || "aucune"}`,
        });
      }
    } catch {
      checks.push({ label: "Droits de publication (Page Token)", ok: false, detail: "Impossible de vérifier les droits" });
    }
  }

  // 7. Test accès à la page Facebook
  if (pageId && pageToken) {
    try {
      const res = await fetch(`${FB_API}/${pageId}?access_token=${pageToken}&fields=id,name,fan_count`);
      const data = await res.json();
      if (data.error) {
        checks.push({ label: "Accès page Facebook", ok: false, detail: `Erreur : ${data.error.message}` });
      } else {
        checks.push({ label: "Accès page Facebook", ok: true, detail: `Page : "${data.name}" — ${data.fan_count?.toLocaleString("fr-FR") ?? "?"} abonnés` });
      }
    } catch {
      checks.push({ label: "Accès page Facebook", ok: false, detail: "Impossible de contacter la page Facebook" });
    }
  }

  // 8. Test compte Instagram
  if (igUserId && pageToken) {
    try {
      const res = await fetch(`${FB_API}/${igUserId}?access_token=${pageToken}&fields=id,username,followers_count`);
      const data = await res.json();
      if (data.error) {
        checks.push({ label: "Accès compte Instagram", ok: false, detail: `Erreur : ${data.error.message}` });
      } else {
        checks.push({ label: "Accès compte Instagram", ok: true, detail: `@${data.username} — ${data.followers_count?.toLocaleString("fr-FR") ?? "?"} abonnés` });
      }
    } catch {
      checks.push({ label: "Accès compte Instagram", ok: false, detail: "Impossible de contacter l'API Instagram" });
    }
  } else {
    checks.push({ label: "Accès compte Instagram", ok: false, detail: igUserId ? "Token manquant" : "instagram_user_id manquant" });
  }

  return new NextResponse(html(checks), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
