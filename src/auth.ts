import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { accounts, sessions, users, subscriptions } from "@/db/schema";
import { eq, asc, and, desc } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  basePath: "/api/auth",
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
  trustHost: true,
  callbacks: {
    // 1. Session Limit Logic
    async signIn({ user }) {
      if (user.id) {
        const userSessions = await db.query.sessions.findMany({
          where: eq(sessions.userId, user.id),
          orderBy: [asc(sessions.expires)],
        });

        if (userSessions.length >= 2) {
          await db
            .delete(sessions)
            .where(eq(sessions.sessionToken, userSessions[0].sessionToken));
        }
      }
      return true;
    },

    // 2. Session Augmentation
    async session({ session, user }) {
      try {
        // DB madhun latest active subscription fetch kara
        const activeSub = await db
          .select()
          .from(subscriptions)
          .where(
            and(
              eq(subscriptions.user_id, user.id),
              eq(subscriptions.is_active, true)
            )
          )
          .orderBy(desc(subscriptions.start_date))
          .limit(1);

        const currentPlan = activeSub[0] || { plan_type: "free" };

        // 🔥 FIX: Direct mutate karnyacha aivaji navin object return kara
        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
            mobile_number: (user as any).mobile_number,
            center_name: (user as any).center_name,
            role: (user as any).role,
            created_at: (user as any).created_at, // Passed for 7-day trial check
            subscription: currentPlan, // <--- Ha data ata frontend la nakki jail
          },
        };

      } catch (error) {
        console.error("🔥 Session fetch error:", error);

        // Fallback in case of error
        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
            subscription: { plan_type: "free" },
          },
        };
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});