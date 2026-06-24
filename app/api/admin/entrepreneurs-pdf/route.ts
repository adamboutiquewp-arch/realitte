import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function GET() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const fontBold   = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontNormal = await doc.embedFont(StandardFonts.Helvetica);

  const rouge  = rgb(0.898, 0.224, 0.208); // #E53935
  const noir   = rgb(0.07, 0.07, 0.07);
  const gris   = rgb(0.5, 0.5, 0.5);
  const grisClair = rgb(0.94, 0.94, 0.94);

  let y = height - 50;

  // ── En-tête ──────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: noir });
  page.drawText("Réalitte.", { x: 40, y: height - 52, size: 26, font: fontBold, color: rgb(1,1,1) });
  page.drawText(".", { x: 108, y: height - 52, size: 26, font: fontBold, color: rouge });
  page.drawText("DOSSIER — ENTREPRENEUR DE LA SEMAINE", {
    x: 40, y: height - 68, size: 8, font: fontNormal, color: rgb(0.6,0.6,0.6),
  });

  y = height - 110;

  // ── Intro ─────────────────────────────────────────────────
  page.drawText("Comment participer ?", { x: 40, y, size: 14, font: fontBold, color: noir });
  y -= 20;
  const introLines = [
    "Chaque semaine, Réalitte met en lumière un entrepreneur et son entreprise.",
    "Remplissez ce dossier et envoyez-le à : contact@realitte.com",
  ];
  for (const line of introLines) {
    page.drawText(line, { x: 40, y, size: 9, font: fontNormal, color: gris });
    y -= 14;
  }
  y -= 10;

  // ── Séparateur ────────────────────────────────────────────
  page.drawRectangle({ x: 40, y, width: width - 80, height: 2, color: rouge });
  y -= 24;

  // ── Fonction pour un champ ────────────────────────────────
  const drawField = (label: string, hint: string, lines = 1) => {
    page.drawText(label.toUpperCase(), { x: 40, y, size: 7.5, font: fontBold, color: rouge });
    y -= 14;
    const boxHeight = lines === 1 ? 24 : lines * 18;
    page.drawRectangle({ x: 40, y: y - boxHeight, width: width - 80, height: boxHeight, color: grisClair, borderColor: rgb(0.82,0.82,0.82), borderWidth: 0.5 });
    page.drawText(hint, { x: 46, y: y - 14, size: 8, font: fontNormal, color: rgb(0.7,0.7,0.7) });
    y -= boxHeight + 16;
  };

  // ── Section Entrepreneur ──────────────────────────────────
  page.drawText("1. L'ENTREPRENEUR", { x: 40, y, size: 11, font: fontBold, color: noir });
  y -= 18;

  drawField("Nom complet *", "Ex : Jean Dupont");
  drawField("Titre / Fonction *", "Ex : CEO & Fondateur, Directrice Générale...");
  drawField("Citation inspirante *", "Une phrase qui vous définit ou résume votre vision...");
  drawField("Biographie *", "Votre parcours, vos réussites, votre vision (5 à 10 lignes)", 5);
  drawField("URL de votre photo (portrait)", "https://... — Format portrait, haute résolution recommandée");

  y -= 6;
  // ── Section Entreprise ────────────────────────────────────
  page.drawRectangle({ x: 40, y, width: width - 80, height: 1, color: rgb(0.88,0.88,0.88) });
  y -= 20;

  page.drawText("2. L'ENTREPRISE", { x: 40, y, size: 11, font: fontBold, color: noir });
  y -= 18;

  drawField("Nom de l'entreprise *", "Ex : Ma Startup SAS");
  drawField("Description *", "Ce que fait l'entreprise, son marché, son impact (3 à 6 lignes)", 4);
  drawField("Site web", "https://www.monentreprise.fr");
  drawField("URL du logo", "https://... — Fond blanc ou transparent recommandé");

  y -= 10;
  // ── Footer ────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width, height: 50, color: noir });
  page.drawText("Réalitte — contact@realitte.com — www.realitte.com", {
    x: 40, y: 18, size: 8, font: fontNormal, color: rgb(0.5,0.5,0.5),
  });
  page.drawText("* Champs obligatoires", {
    x: width - 160, y: 18, size: 8, font: fontNormal, color: rgb(0.5,0.5,0.5),
  });

  const pdfBytes = await doc.save();
  const buffer = Buffer.from(pdfBytes);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="realitte-dossier-entrepreneur.pdf"',
    },
  });
}
