import { auth } from "@/auth";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
// 🔥 FIX: and ani desc import kele
import { eq, and, desc } from "drizzle-orm";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // We rely on the subscription attached by the auth.ts session callback
  // which safely handles transient DB errors using a try/catch.
  return {
    ...session.user,
    subscription: (session.user as any).subscription || { plan_type: "free" },
  };
}