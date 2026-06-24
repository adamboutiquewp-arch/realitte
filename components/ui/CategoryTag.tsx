import Link from "next/link";

interface CategoryTagProps {
  nom: string;
  slug: string;
  couleur?: string;
  size?: "sm" | "md";
  asLink?: boolean;
}

export default function CategoryTag({
  nom,
  slug,
  couleur,
  size = "sm",
  asLink = true,
}: CategoryTagProps) {
  const style = couleur ? { color: couleur } : undefined;
  const sizeClass = size === "md" ? "text-xs" : "text-[11px]";
  const className = `inline-block font-bold tracking-widest uppercase ${sizeClass} leading-none`;

  if (asLink) {
    return (
      <Link
        href={`/${slug}`}
        className={className}
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        {nom}
      </Link>
    );
  }

  return (
    <span className={className} style={style}>
      {nom}
    </span>
  );
}
