import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      _id: string;
      role: string;
      email: string;
      name: string;
      image?: string;
    };
  }
}

declare module "@auth/core/types" {
  interface User {
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    _id?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    role: string;
    _id: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          },
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "Invalid credentials");
        }

        const userData = json.data;
        const { user, accessToken, refreshToken } = userData;

        // Only allow admin/super_admin users
        if (user.role !== "admin" && user.role !== "super_admin") {
          throw new Error("Access denied. Admin privileges required.");
        }

        return {
          id: user._id,
          _id: user._id,
          email: user.email,
          name: user.userName || user.fullName,
          image: user.avatar?.url || "",
          role: user.role,
          accessToken,
          refreshToken,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken as string;
        token.refreshToken = (user as any).refreshToken as string;
        token.role = (user as any).role as string;
        token._id = (user as any)._id as string;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user = {
        ...session.user,
        _id: token._id as string,
        role: token.role as string,
      };
      return session;
    },
    async authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isOnDashboard =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/users") ||
        nextUrl.pathname.startsWith("/content") ||
        nextUrl.pathname.startsWith("/notifications") ||
        nextUrl.pathname.startsWith("/settings");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // redirect to login
      }

      if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig);
