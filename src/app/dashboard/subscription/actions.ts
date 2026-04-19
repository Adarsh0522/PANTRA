"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { referrals, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

    // Now, extend subscription by 30 days
    const currentSub = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.user_id, user.id)
    });

    const now = new Date();
    let newEndDate = new Date(now);
    newEndDate.setDate(newEndDate.getDate() + 30); // Base: +30 days from now

    let newPlanType = 'monthly';
    
    if (currentSub) {
      if (currentSub.end_date && currentSub.end_date > now) {
        // Add 30 days to existing active plan
        newEndDate = new Date(currentSub.end_date);
        newEndDate.setDate(newEndDate.getDate() + 30);
      }
      // If currently free, set it to monthly or promotional
      newPlanType = currentSub.plan_type === 'free' ? 'monthly' : currentSub.plan_type;
      
      await db.update(subscriptions)
        .set({
          end_date: newEndDate,
          is_active: true,
          plan_type: newPlanType,
        })
        .where(eq(subscriptions.id, currentSub.id));
    } else {
      // Create new subscription if none existed (unlikely, but safe)
      await db.insert(subscriptions).values({
        id: crypto.randomUUID(),
        user_id: user.id,
        plan_type: 'monthly',
        is_active: true,
        start_date: now,
        end_date: newEndDate,
        download_limit: 999999,
        downloads_used: 0,
      });
    }

    // Update the referral row
    await db.update(referrals)
      .set({
        rewards_claimed: rewards_claimed + 1
      })
      .where(eq(referrals.id, userReferral.id));

    revalidatePath("/dashboard/subscription");
    revalidatePath("/dashboard");

    return { success: true, message: "Successfully claimed 1 month free!" };
  } catch (error) {
    console.error("Reward claim error:", error);
    return { success: false, message: "Internal server error" };
  }
}
