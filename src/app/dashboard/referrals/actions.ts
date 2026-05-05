"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { referrals, subscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Claim referral reward: adds bonus download credits.
 * Reward: +10 downloads per eligible claim (every 2 converted referrals).
 * No expiry manipulation — pure download credits.
 */
export async function claimReferralReward() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "Not authenticated" };
    }

    const userReferral = await db.query.referrals.findFirst({
      where: eq(referrals.user_id, user.id)
    });

    if (!userReferral) {
      return { success: false, message: "No active referrals found" };
    }

    const { converted_users_count, rewards_claimed } = userReferral;
    const eligibleClaims = Math.floor(converted_users_count / 2);

    if (rewards_claimed >= eligibleClaims) {
      return { success: false, message: "Not eligible for a reward at this time." };
    }

    // Add +10 bonus downloads to the user's active subscription
    const currentSub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.user_id, user.id),
        eq(subscriptions.is_active, true)
      ),
    });

    const REWARD_DOWNLOADS = 10;

    if (currentSub) {
      await db.update(subscriptions)
        .set({
          download_limit: (currentSub.download_limit || 0) + REWARD_DOWNLOADS,
        })
        .where(eq(subscriptions.id, currentSub.id));
    } else {
      // Create new subscription if none existed (unlikely, but safe)
      await db.insert(subscriptions).values({
        id: crypto.randomUUID(),
        user_id: user.id,
        plan_type: 'free',
        is_active: true,
        start_date: new Date(),
        end_date: null,
        download_limit: 5 + REWARD_DOWNLOADS,
        downloads_used: 0,
        free_downloads_today: 0,
        watermark_downloads_today: 0,
      });
    }

    // Update the referral row
    await db.update(referrals)
      .set({
        rewards_claimed: rewards_claimed + 1
      })
      .where(eq(referrals.id, userReferral.id));

    revalidatePath("/dashboard/referrals");
    revalidatePath("/dashboard");

    return { success: true, message: `Successfully claimed ${REWARD_DOWNLOADS} bonus downloads!` };
  } catch (error) {
    console.error("Reward claim error:", error);
    return { success: false, message: "Internal server error" };
  }
}
