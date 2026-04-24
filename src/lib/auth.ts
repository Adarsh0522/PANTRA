import { auth } from "@/auth";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
// 🔥 FIX: and ani desc import kele
import { eq, and, desc } from "drizzle-orm";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // 🔥 FIX: Fakt active plan fetch kara aani latest pahilyanda gya
  const activeSub = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.user_id, session.user.id),
        eq(subscriptions.is_active, true)
      )
    )
    .orderBy(desc(subscriptions.start_date))
    .limit(1);

  return {
    ...session.user,
    subscription: activeSub[0] || null, // Navin active plan attach kela
  };
}