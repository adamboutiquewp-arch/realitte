import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "@/../auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:      { label: "Email",         type: "email" },
        motDePasse: { label: "Mot de passe",  type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const motDePasse = credentials?.motDePasse as string;

        if (!email || !motDePasse) return null;

        const admin = await prisma.adminUser.findUnique({
          where: { email: email.toLowerCase().trim() },
        });

        if (!admin || !admin.actif) return null;

        const valid = await bcrypt.compare(motDePasse, admin.motDePasseHash);
        if (!valid) return null;

        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { derniereConnexion: new Date() },
        });

        return {
          id: admin.id,
          email: admin.email,
          name: admin.nom || admin.email,
          role: admin.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
});
