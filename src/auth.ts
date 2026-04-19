import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { accounts, sessions, users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  providers: [
    // FIX: Here it MUST be initialized as a function Google() not just Google
    Google({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    // 1. Session Limit Logic
    async signIn({ user }) {
      if (user.id) {
        // Fetch all current sessions for this user
        const userSessions = await db.query.sessions.findMany({
          where: eq(sessions.userId, user.id),
          orderBy: [asc(sessions.expires)],
        });

        // Enforce max 2 active sessions limit
        if (userSessions.length >= 2) {
          // Delete oldest session systematically before creating the new one
          await db
            .delete(sessions)
            .where(eq(sessions.sessionToken, userSessions[0].sessionToken));
        }
      }
      return true;
    },
    // 2. Session Augmentation
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        // Extend NextAuth session payload securely
        session.user.mobile_number = (user as any).mobile_number;
        session.user.center_name = (user as any).center_name;
        session.user.role = (user as any).role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});