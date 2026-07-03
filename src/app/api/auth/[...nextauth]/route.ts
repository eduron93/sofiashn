import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      try {
        const { prisma } = await import("@/lib/prisma");
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (!existing) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name ?? "",
              image: user.image ?? null,
              password: "",
            },
          });
        }
      } catch {
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (token.email) session.user.email = token.email as string;
      return session;
    },
  },
  pages: {
    signIn: "/cuenta",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
