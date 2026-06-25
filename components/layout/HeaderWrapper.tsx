import { prisma } from "@/lib/prisma";
import Header from "./Header";

export default async function HeaderWrapper() {
  let socialLinks: { cle: string; valeur: string }[] = [];
  try {
    socialLinks = await prisma.siteConfig.findMany({
      where: { cle: { startsWith: "social_" } },
    });
  } catch {}

  const get = (cle: string) => socialLinks.find((s) => s.cle === cle)?.valeur || "";

  const socials = [
    { label: "Instagram", cle: "social_instagram", href: get("social_instagram") },
    { label: "X",         cle: "social_x",         href: get("social_x") },
    { label: "TikTok",    cle: "social_tiktok",    href: get("social_tiktok") },
    { label: "YouTube",   cle: "social_youtube",   href: get("social_youtube") },
    { label: "LinkedIn",  cle: "social_linkedin",  href: get("social_linkedin") },
    { label: "Facebook",  cle: "social_facebook",  href: get("social_facebook") },
  ].filter((s) => s.href);

  return <Header socialLinks={socials} />;
}
