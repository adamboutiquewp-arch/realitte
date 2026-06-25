"use client";

const SITE_URL = "https://realitte.com";

interface Article {
  id: string;
  slug: string;
  categorie: { slug: string };
}

interface Props {
  article: Article;
  variant?: "list" | "editor";
}

export default function FacebookPostButton({ article, variant = "list" }: Props) {
  const url = `${SITE_URL}/${article.categorie.slug}/${article.slug}`;
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  const open = () => window.open(shareUrl, "_blank", "width=600,height=500");

  if (variant === "editor") {
    return (
      <button
        onClick={open}
        className="px-4 py-2.5 bg-[#1877F2] text-white text-[12px] font-bold tracking-widest uppercase hover:bg-[#166FE5] transition-colors flex items-center gap-2"
      >
        <FacebookIcon size={14} />
        Facebook
      </button>
    );
  }

  return (
    <button
      onClick={open}
      title="Partager sur Facebook"
      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1877F2] text-white text-[11px] font-bold rounded hover:bg-[#166FE5] transition-colors"
    >
      <FacebookIcon size={12} />
      FB
    </button>
  );
}

function FacebookIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
