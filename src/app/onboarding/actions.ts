"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users, referrals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function submitOnboarding(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("unauthorized");
  }

  const mobile_number = formData.get("mobile_number") as string;
  const center_name = formData.get("center_name") as string;

  if (!mobile_number) {
    throw new Error("Mobile Number is required");
  }

  // Check if current user already has a referred_by set
  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id)
  });

  // Check for referral
  const cookieStore = await cookies();
  const refCode = cookieStore.get("pantra_ref")?.value;
  let referredById = currentUser?.referred_by || null;

  if (refCode && !currentUser?.referred_by) {
    const referrer = await db.query.referrals.findFirst({
      where: eq(referrals.referral_code, refCode),
    });

    if (referrer && referrer.user_id !== session.user.id) {
      referredById = referrer.user_id;

      // Increment referrer's referred_users_count
      await db
        .update(referrals)
        .set({
          referred_users_count: referrer.referred_users_count + 1,
        })
        .where(eq(referrals.id, referrer.id));
    }
  }

  await db
    .update(users)
    .set({
      mobile_number,
      center_name: center_name || null,
      referred_by: referredById,
    })
    .where(eq(users.id, session.user.id));

  // Redirect immediately sets the cookie/header and throws an internal NEXT error to halt execution
  redirect("/dashboard");
}
