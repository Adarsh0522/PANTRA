import { auth } from "@/auth";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Fetch active subscription for the user to keep the same API
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.user_id, session.user.id),
  });

  return {
    ...session.user,
    subscription: sub,
  };
}

