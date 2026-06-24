import type { NextAuthConfig } from "next-auth";

// Config légère sans Prisma — utilisée par le middleware (Edge runtime)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isLoginPage = nextUrl.pathname === "/admin/login";

      if (isAdminRoute && !isLoginPage) {
        return isLoggedIn;
      }
      return true;
    },
  },
};
