import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.COOKIE_DOMAIN || undefined,
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        accessCode: { label: "Code d'acces", type: "text" },
      },
      async authorize(credentials) {
        const accessCode = credentials?.accessCode?.trim();
        if (accessCode) {
          const access = await prisma.clientPortalAccessCode.findFirst({
            where: {
              code: accessCode,
              active: true,
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            include: {
              client: {
                include: {
                  users: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          });
          const clientUser = access?.client.users.find((u) => u.user.role === Role.CLIENT && u.user.active)?.user;
          if (!clientUser) return null;

          await prisma.clientPortalAccessCode.update({
            where: { id: access.id },
            data: { lastUsedAt: new Date() },
          });
          return {
            id: clientUser.id,
            email: clientUser.email,
            name: clientUser.name,
            role: clientUser.role,
          };
        }

        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user?.password || !user.active) return null;

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: Role }).role ?? Role.TECHNICIAN;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as Role) ?? Role.TECHNICIAN;
      }
      return session;
    },
  },
};
