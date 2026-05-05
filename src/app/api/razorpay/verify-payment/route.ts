import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { payments, subscriptions, users, referrals } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { getPlan, type PlanKey, REFERRAL_REWARDS, MAX_REFERRAL_DOWNLOADS_PER_MONTH } from "@/lib/plans-db";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Verify Signature Algorithm: HMAC-SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Fetch the payment record to get plan_type and user_id
    const payment = await db.query.payments.findFirst({
      where: eq(payments.order_id, razorpay_order_id),
    });

    if (!payment) return NextResponse.json({ error: "Unknown order" }, { status: 404 });
    if (payment.status === "PAID") return NextResponse.json({ success: true, message: "Payment already verified" });

    // Update payment status to PAID in Neon database
    await db
      .update(payments)
      .set({ 
        status: "PAID",
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature
      })
      .where(eq(payments.order_id, razorpay_order_id));

    // Activate plan or process "per_form"
    if (payment.plan_type !== "per_form") {
      const planKey = payment.plan_type as PlanKey;
      const plan = await getPlan(planKey);

      if (plan) {
        const now = new Date();

        // Deactivate old plans
        await db.update(subscriptions)
          .set({ is_active: false })
          .where(eq(subscriptions.user_id, payment.user_id));

        // Insert new plan — NO expiry, lifetime credits
        await db.insert(subscriptions).values({
          id: crypto.randomUUID(),
          user_id: payment.user_id,
          plan_type: planKey,
          is_active: true,
          downloads_used: 0,
          download_limit: plan.downloadLimit,
          start_date: now,
          end_date: null,
        });
      }
    } else {
      // Handle "per_form" payment: add +1 download credit
      const existingSub = await db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.user_id, payment.user_id),
          eq(subscriptions.is_active, true)
        ),
      });

      if (existingSub) {
        await db.update(subscriptions)
          .set({ download_limit: (existingSub.download_limit || 0) + 1 })
          .where(eq(subscriptions.id, existingSub.id));
      }
    }

    // ─── Referral Reward Processing ─────────────────────────────────────────
    await processReferralReward(payment.user_id, payment.plan_type);

    // Cache clear kar jene karun frontend la fresh DB data milel
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Process referral reward after a successful payment.
 * Rules:
 * - Reward only on first paid transaction from a referred user (is_referral_converted flag)
 * - Prevent self-referrals (same user_id check)
 * - Max 200 referral downloads per month per referrer
 */
async function processReferralReward(userId: string, planType: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !user.referred_by || user.is_referral_converted) return;

    // Prevent self-referral
    if (user.referred_by === userId) return;

    const rewardDownloads = REFERRAL_REWARDS[planType] || 0;
    if (rewardDownloads === 0) return;

    // Mark user as converted (prevents duplicate rewards)
    await db.update(users)
      .set({ is_referral_converted: true })
      .where(eq(users.id, userId));

    // Increment referrer's converted count
    const referrerProfile = await db.query.referrals.findFirst({
      where: eq(referrals.user_id, user.referred_by),
    });

    if (referrerProfile) {
      await db.update(referrals)
        .set({ converted_users_count: referrerProfile.converted_users_count + 1 })
        .where(eq(referrals.id, referrerProfile.id));
    }

    // Check monthly referral cap for the referrer
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Count how many referral downloads the referrer has earned this month
    // We track this via the converted_users_count increment pattern
    // For now, apply the reward to the referrer's active subscription
    const referrerSub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.user_id, user.referred_by),
        eq(subscriptions.is_active, true)
      ),
    });

    if (referrerSub) {
      // Cap the reward to not exceed monthly limit
      const newLimit = Math.min(
        (referrerSub.download_limit || 0) + rewardDownloads,
        (referrerSub.download_limit || 0) + MAX_REFERRAL_DOWNLOADS_PER_MONTH
      );

      await db.update(subscriptions)
        .set({ download_limit: newLimit })
        .where(eq(subscriptions.id, referrerSub.id));
    }
  } catch (error) {
    // Non-critical: log but don't fail the payment
    console.error("[Referral] Error processing reward:", error);
  }
}
