export type StatutArticle = "PENDING" | "DRAFT" | "PUBLISHED" | "REJECTED";
export type StatutAvis = "PENDING" | "APPROVED" | "REJECTED";
export type RoleAdmin = "SUPER_ADMIN" | "EDITEUR";

export interface Categorie {
  id: string;
  nom: string;
  slug: string;
  couleur: string;
  ordre: number;
}

export interface Article {
  id: string;
  titre: string;
  slug: string;
  chapo: string;
  contenu: string;
  imageUrl: string | null;
  imageAlt: string | null;
  categorieId: string;
  categorie: Categorie;
  sousCategorie: string | null;
  tags: string[];
  sourceUrl: string;
  sourceNom: string;
  statut: StatutArticle;
  auteur: string;
  vues: number;
  tempsLecture: number | null;
  featured: boolean;
  imageClean: boolean;
  dateCreation: Date | string;
  datePublication: Date | string | null;
}

export interface ArticleCard
  extends Pick<
    Article,
    | "id"
    | "titre"
    | "slug"
    | "chapo"
    | "imageUrl"
    | "imageAlt"
    | "sousCategorie"
    | "tags"
    | "datePublication"
    | "tempsLecture"
    | "vues"
  > {
  imageClean?: boolean;
  categorie: Pick<Categorie, "nom" | "slug" | "couleur">;
}

export interface DerniereInfo {
  id: string;
  titre: string;
  slug: string;
  categorieNom: string;
  categorieCouleur: string;
  categorieSlug: string;
  imageUrl: string | null;
  datePublication: Date | string | null;
}

export interface NavItem {
  label: string;
  href: string;
  slug?: string;
}

export const CATEGORIES: Record<string, { couleur: string; class: string }> = {
  actu:             { couleur: "#E53935", class: "tag-actu" },
  sport:            { couleur: "#E53935", class: "tag-sport" },
  economie:         { couleur: "#1565C0", class: "tag-economie" },
  politique:        { couleur: "#212121", class: "tag-politique" },
  "success-stories":{ couleur: "#00838F", class: "tag-success" },
  people:           { couleur: "#E91E63", class: "tag-people" },
  "sante-beaute":   { couleur: "#00897B", class: "tag-sante" },
  "fait-divers":    { couleur: "#455A64", class: "tag-fait-divers" },
};

export function getCategoryClass(slug: string): string {
  return CATEGORIES[slug]?.class ?? "tag-actu";
}

export function getCategoryColor(slug: string): string {
  return CATEGORIES[slug]?.couleur ?? "#E53935";
}
