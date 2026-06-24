import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const CATEGORIES = [
  { nom: "Actu",           slug: "actu",            couleur: "#E53935", ordre: 0 },
  { nom: "Sport",          slug: "sport",           couleur: "#E53935", ordre: 1 },
  { nom: "Économie",       slug: "economie",        couleur: "#1565C0", ordre: 2 },
  { nom: "Politique",      slug: "politique",       couleur: "#212121", ordre: 3 },
  { nom: "Anecdote",       slug: "anecdote",        couleur: "#C9A84C", ordre: 4 },
  { nom: "Success Stories",slug: "success-stories", couleur: "#C9A84C", ordre: 5 },
];

const ARTICLES_DEMO = [
  {
    titre: "Ligue des champions : Paris renverse tout !",
    slug: "ligue-champions-paris-renverse-tout",
    chapo: "Un match à couper le souffle et une qualification historique.",
    contenu: "<p>Le Paris Saint-Germain a réalisé une remontada exceptionnelle face à Barcelone, s'imposant 3-2 après avoir été mené 2-0 à la pause. Une soirée qui restera dans les annales du football européen.</p><h2>Une première période difficile</h2><p>Les Catalans ont rapidement pris le contrôle du match, profitant d'une défense parisienne hésitante. Mais la pause a tout changé.</p><h2>La réaction d'orgueil</h2><p>Trois buts en trente minutes ont suffi aux Parisiens pour retourner la situation. Un résultat qui propulse le club en demi-finales.</p>",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    categorieSlug: "sport",
    sousCategorie: "Football",
    tags: ["PSG", "Ligue des Champions", "Football"],
    sourceUrl: "https://www.lequipe.fr",
    sourceNom: "L'Équipe",
    featured: true,
  },
  {
    titre: "Taux d'intérêt : vers un tournant décisif",
    slug: "taux-interet-tournant-decisif",
    chapo: "La BCE pourrait changer de cap dans les prochains mois.",
    contenu: "<p>La Banque centrale européenne envisage de revoir sa politique monétaire face à l'évolution de l'inflation dans la zone euro. Les marchés anticipent une baisse des taux dès le prochain trimestre.</p><h2>Un contexte inflationniste qui change</h2><p>Après deux années de hausses successives, l'inflation européenne montre des signes d'atténuation, ouvrant la voie à un assouplissement monétaire.</p>",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    categorieSlug: "economie",
    sousCategorie: "Finance",
    tags: ["BCE", "Taux d'intérêt", "Économie", "Inflation"],
    sourceUrl: "https://www.lesechos.fr",
    sourceNom: "Les Échos",
    featured: false,
  },
  {
    titre: "Remaniement : les nouveaux visages du pouvoir",
    slug: "remaniement-nouveaux-visages-pouvoir",
    chapo: "Analyse des enjeux derrière ce nouveau gouvernement.",
    contenu: "<p>Le nouveau gouvernement fraîchement nommé affiche des ambitions claires : relancer l'économie, réformer le système de santé et répondre aux préoccupations sécuritaires des Français.</p><h2>Les grands dossiers</h2><p>Le nouveau Premier ministre hérite d'une situation complexe : majorité relative, tensions sociales et agenda législatif chargé.</p>",
    imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    categorieSlug: "politique",
    sousCategorie: "France",
    tags: ["Gouvernement", "Politique", "Remaniement"],
    sourceUrl: "https://www.lemonde.fr",
    sourceNom: "Le Monde",
    featured: false,
  },
  {
    titre: "Il a tout quitté pour vivre en van",
    slug: "tout-quitte-vivre-en-van",
    chapo: "Son histoire va vous rappeler l'essentiel.",
    contenu: "<p>À 34 ans, Thomas Moreau a abandonné son poste de cadre dans une grande entreprise parisienne pour sillonner l'Europe à bord d'un vieux van aménagé. Un choix radical qui a transformé sa vision du monde.</p><h2>Le déclic</h2><p>Tout a commencé par un burn-out sévère et une question simple : est-ce vraiment la vie que je veux mener ?</p><h2>La vie sur la route</h2><p>Deux ans plus tard, Thomas ne regrette rien. Il documente son voyage sur les réseaux et inspire des milliers de personnes à questionner leurs choix de vie.</p>",
    imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    categorieSlug: "anecdote",
    sousCategorie: "Société",
    tags: ["Van life", "Liberté", "Reconversion"],
    sourceUrl: "https://www.vanlife-magazine.fr",
    sourceNom: "Van Life Magazine",
    featured: false,
  },
  {
    titre: "De livreur à millionnaire : son parcours inspirant",
    slug: "livreur-millionnaire-parcours-inspirant",
    chapo: "Comment Karim a bâti un empire depuis rien.",
    contenu: "<p>Karim Benali a commencé en livrant des pizzas à Marseille. Dix ans plus tard, il dirige une entreprise de logistique qui emploie 200 personnes. Son secret ? La discipline, l'épargne et un timing parfait.</p><h2>Les débuts</h2><p>À 22 ans, sans diplôme ni réseau, Karim économisait 30% de chaque salaire, quelle que soit sa situation.</p><h2>Le tournant</h2><p>Son premier investissement dans l'immobilier lui a rapporté assez pour lancer sa première société de transport.</p>",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    categorieSlug: "success-stories",
    sousCategorie: "Entrepreneuriat",
    tags: ["Entrepreneuriat", "Success", "Réussite", "Marseille"],
    sourceUrl: "https://www.capital.fr",
    sourceNom: "Capital",
    featured: false,
  },
  {
    titre: "Elle révolutionne l'éducation en Afrique",
    slug: "revolutionne-education-afrique",
    chapo: "L'innovation qui change des milliers de vies.",
    contenu: "<p>Fatou Diallo, 29 ans, a fondé une startup EdTech basée à Dakar qui propose des cours en ligne adaptés aux élèves africains. Avec 50 000 utilisateurs en 18 mois, elle est devenue l'une des entrepreneurs les plus influentes du continent.</p>",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
    categorieSlug: "success-stories",
    sousCategorie: "Innovation",
    tags: ["EdTech", "Afrique", "Innovation", "Éducation"],
    sourceUrl: "https://www.jeune-afrique.com",
    sourceNom: "Jeune Afrique",
    featured: false,
  },
  {
    titre: "Sorti de prison, il crée une startup à succès",
    slug: "sorti-prison-startup-succes",
    chapo: "La persévérance au-delà de toutes les épreuves.",
    contenu: "<p>À sa sortie de prison après 4 ans d'incarcération, Marc Lebrun n'avait ni argent ni logement. Aujourd'hui, sa startup de recyclage électronique réalise 3 millions d'euros de chiffre d'affaires annuel et emploie une vingtaine de personnes, dont plusieurs ex-détenus.</p>",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
    categorieSlug: "success-stories",
    sousCategorie: "Persévérance",
    tags: ["Réinsertion", "Entrepreneuriat", "Recyclage"],
    sourceUrl: "https://www.bfmtv.com",
    sourceNom: "BFMTV",
    featured: false,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Catégories
  for (const cat of CATEGORIES) {
    await prisma.categorie.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    console.log(`  ✓ Catégorie: ${cat.nom}`);
  }

  // Articles de démo
  for (const article of ARTICLES_DEMO) {
    const cat = await prisma.categorie.findUnique({
      where: { slug: article.categorieSlug },
    });
    if (!cat) continue;

    const { categorieSlug, ...data } = article;
    await prisma.article.upsert({
      where: { slug: data.slug },
      update: {
        ...data,
        categorieId: cat.id,
        statut: "PUBLISHED",
        datePublication: new Date(),
        tempsLecture: Math.ceil(data.contenu.length / 1000),
      },
      create: {
        ...data,
        categorieId: cat.id,
        statut: "PUBLISHED",
        datePublication: new Date(),
        tempsLecture: Math.ceil(data.contenu.length / 1000),
      },
    });
    console.log(`  ✓ Article: ${data.titre.slice(0, 50)}…`);
  }

  // Super Admin
  const adminEmail = "admin@realitte.fr";
  const existing = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash("Realitte2025!", 12);
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        motDePasseHash: hash,
        nom: "Super Admin",
        role: "SUPER_ADMIN",
      },
    });
    console.log("  ✓ Admin: admin@realitte.fr / Realitte2025!");
    console.log("  ⚠️  Changez le mot de passe immédiatement après le premier login!");
  }

  // Espace partenaire par défaut
  const espaceExist = await prisma.espacePartenaire.findFirst();
  if (!espaceExist) {
    await prisma.espacePartenaire.create({
      data: {
        titre: "Votre marque ici, dans un environnement premium.",
        sousTitre: "ESPACE PARTENAIRE",
        ctaTexte: "EN SAVOIR PLUS",
        lien: "/partenaires",
        actif: true,
        position: "home",
      },
    });
    console.log("  ✓ Espace partenaire créé");
  }

  console.log("✅ Seed terminé !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
