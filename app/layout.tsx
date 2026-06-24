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

export const metadata: Metadata = {
  title: {
    default: "Réalitte — Le vrai. Le brut. Le mérité.",
    template: "%s | Réalitte",
  },
  description:
    "Réalitte, le média de ceux qui veulent comprendre le monde et ceux qui le changent. Actu, Sport, Économie, Politique, Anecdotes, Success Stories.",
  keywords: ["actualité", "news", "sport", "économie", "politique", "france"],
  authors: [{ name: "Réalitte" }],
  creator: "Réalitte",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://realitte.fr"
  ),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Réalitte",
  },
  robots: {
    index: true,
    follow: true,
  },
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
      <body className="min-h-screen flex flex-col bg-white text-[#111111] antialiased">
        {children}
      </body>
    </html>
  );
}
