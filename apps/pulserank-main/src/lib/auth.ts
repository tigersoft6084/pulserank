import { AuthOptions, DefaultSession, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@repo/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isActive?: boolean;
      isVerified?: boolean;
      credits: {
        trackingSitesCount?: { limit: number; used: number };
        keywordsCount?: { limit: number; used: number };
        unlockedDomainsCount?: { limit: number; used: number };
      };
      intercomAppId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    isVerified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isVerified?: boolean;
  }
}

export const authConfig: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET!,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Incorrect email or password");
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email first");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/verify-email",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.isVerified = user.isVerified;
      }

      const dbUser = await prisma.user.findFirst({
        where: { email: token.email! },
      });

      if (dbUser) {
        token.id = dbUser.id;
        token.isVerified = dbUser.isVerified;
      }
      return token;
    },
    session: async ({ token, session }) => {
      if (token) {
        /*
        get user's userOrder, user's trackingSites length, user's keywords length, user's unlockedDomains length
        get user's
         */
        const initialCredentials = {
          trackingSitesCount: { limit: 0, used: 0 },
          keywordsCount: { limit: 0, used: 0 },
          unlockedDomainsCount: { limit: 0, used: 0 },
        };
        const user = await prisma.user.findFirst({
          where: { id: token.id },
          select: {
            userOrders: {
              select: {
                plan: true,
                status: true,
                currentPeriodEnd: true,
              },
            },
            trackingSites: true,
            keywords: true,
            unlockedDomains: true,
          },
        });
        if (user && user.userOrders && user.userOrders.length > 0) {
          const userOrder = user.userOrders[0];
          const plan = userOrder?.plan;
          const constraints = plan?.constraints as {
            trackingSites?: number;
            keywords?: number;
            unlockedDomains?: number;
          } | null;

          initialCredentials.trackingSitesCount.limit =
            constraints?.trackingSites || 0;
          initialCredentials.keywordsCount.limit = constraints?.keywords || 0;
          initialCredentials.unlockedDomainsCount.limit =
            constraints?.unlockedDomains || 0;
          initialCredentials.trackingSitesCount.used =
            user.trackingSites?.length || 0;
          initialCredentials.keywordsCount.used = user.keywords?.length || 0;
          initialCredentials.unlockedDomainsCount.used =
            user.unlockedDomains?.length || 0;
        }
        const now = new Date();

        const isActive = user
          ? (user.userOrders &&
              user.userOrders.length > 0 &&
              Boolean(user.userOrders[0]?.status === "ACTIVE")) ||
            (user.userOrders[0]?.status === "CANCELLED" &&
              user.userOrders[0]?.currentPeriodEnd &&
              new Date(user.userOrders[0]?.currentPeriodEnd) > now)
          : false;

        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.isActive = isActive || false;
        session.user.credits = initialCredentials;
      }

      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: "client-session-token",
      options: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      },
    },
  },
};

export async function getUser() {
  return await getServerSession(authConfig);
}
