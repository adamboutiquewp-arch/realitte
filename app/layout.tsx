import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: {
    default: "Réalitte — Le vrai. Le brut. Le mérité.",
    template: "%s | Réalitte",
  },
  description:
    "Réalitte, le média de ceux qui veulent comprendre le monde et ceux qui le changent. Actu, Sport, Économie, Politique, Créateurs, Entrepreneurs.",
  keywords: [
    "actualité", "actu", "news", "sport", "économie", "politique",
    "créateurs de contenu", "entrepreneurs", "france", "réalitte",
  ],
  authors: [{ name: "Réalitte", url: SITE_URL }],
  creator: "Réalitte",
  publisher: "Réalitte",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Réalitte",
    url: SITE_URL,
    title: "Réalitte — Le vrai. Le brut. Le mérité.",
    description:
      "Le média de ceux qui veulent comprendre le monde et ceux qui le changent.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@realitte",
    creator: "@realitte",
    title: "Réalitte — Le vrai. Le brut. Le mérité.",
    description:
      "Le média de ceux qui veulent comprendre le monde et ceux qui le changent.",
  },
  verification: {
    google: "6ad3e2e6f14b2426",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: "Réalitte",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
    width: 200,
    height: 60,
  },
  sameAs: [
    "https://instagram.com/realitte",
    "https://x.com/realitte",
    "https://linkedin.com/company/realitte",
    "https://youtube.com/@realitte",
  ],
  description:
    "Réalitte est un média français d'actualité couvrant l'actu, le sport, la politique, les créateurs de contenu et les entrepreneurs.",
  foundingDate: "2024",
  inLanguage: "fr",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Réalitte" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#E53935" />
        <script dangerouslySetInnerHTML={{
          __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}`
        }} />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-[#111111] antialiased">
        {children}
      </body>
    </html>
  );
}
