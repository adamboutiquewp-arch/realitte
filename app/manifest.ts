import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Réalitte — Le vrai. Le brut. Le mérité.",
    short_name: "Réalitte",
    description: "Le média de ceux qui veulent comprendre le monde et ceux qui le changent.",
    start_url: "/",
    display: "standalone",
    background_color: "#111111",
    theme_color: "#E53935",
    orientation: "portrait-primary",
    lang: "fr",
    categories: ["news", "magazines"],
    icons: [
      { src: "/api/pwa-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/api/pwa-icon/512", sizes: "512x512", type: "image/png" },
      { src: "/api/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [],
  };
}
