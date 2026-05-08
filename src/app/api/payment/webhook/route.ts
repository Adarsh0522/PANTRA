import { NextResponse } from "next/server";
import { db } from "@/db";
import { payments, subscriptions, users, referrals } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getPlan, type PlanKey, REFERRAL_REWARDS, MAX_REFERRAL_DOWNLOADS_PER_MONTH } from "@/lib/plans-db";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    let orderId: string | null = null;
    let rawStatus: string = "";
    let txnId: string | null = null;

    const contentType = req.headers.get("content-type") || "";

    // Data form kiva JSON format madhun Extract kara
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      orderId = (formData.get("order_id") || formData.get("orderId")) as string;
      rawStatus = (formData.get("status") || formData.get("payment_status") || formData.get("order_status") || "") as string;
      txnId = (formData.get("txn_id") || formData.get("utr") || formData.get("transaction_id")) as string;
    } else {
      const body = await req.json();
      orderId = body.order_id || body.orderId;
      rawStatus = body.status || body.payment_status || body.order_status || "";
      txnId = body.txn_id || body.utr || body.transaction_id || null;
    }

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const payment = await db.query.payments.findFirst({
      where: eq(payments.order_id, orderId),
    });

    if (!payment) return NextResponse.json({ error: "Unknown order" }, { status: 404 });
    if (payment.status === "PAID") return NextResponse.json({ status: "already_processed" });

    // FRINEXT API BYPASS: Webhook chya Data var vishwas theva
    const apiStatus = String(rawStatus).toUpperCase();

    if (apiStatus === "COMPLETED" || apiStatus === "SUCCESS") {
      await db
        .update(payments)
        .set({
          status: "PAID",
          frinext_txn_id: txnId,
        })
        .where(eq(payments.order_id, orderId));

      // Activate plan
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

      // ─── Referral Reward Processing ─────────────────────────────────────
      await processReferralReward(payment.user_id, payment.plan_type);

      // Cache clear kar jene karun frontend la fresh DB data milel
      revalidatePath('/', 'layout');

      return NextResponse.json({ status: "verified_and_activated" });
    }

    return NextResponse.json({ status: "not_completed" });
  } catch (error) {
    console.error("[Webhook] Error processing:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

/**
 * Process referral reward after a successful payment.
 * Rules:
 * - Reward only on first paid transaction from a referred user (is_referral_converted flag)
 * - Prevent self-referrals (same user_id check)
 * - Automatic dual-reward fulfillment (Form vs Sub)
 */
async function processReferralReward(userId: string, planType: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !user.referred_by || user.is_referral_converted) return;

    // Prevent self-referral
    if (user.referred_by === userId) return;

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

    // Apply the reward to the referrer's active subscription
    const referrerSub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.user_id, user.referred_by),
        eq(subscriptions.is_active, true)
      ),
    });

    const now = new Date();

    if (planType === "per_form") {
      // Reward: +1 Free Form
      if (referrerSub) {
        await db.update(subscriptions)
          .set({ download_limit: (referrerSub.download_limit || 0) + 1 })
          .where(eq(subscriptions.id, referrerSub.id));
      } else {
        await db.insert(subscriptions).values({
          id: crypto.randomUUID(),
          user_id: user.referred_by,
          plan_type: 'free',
          is_active: true,
          download_limit: 6, // 5 base + 1 reward
          downloads_used: 0,
          free_downloads_today: 0,
          watermark_downloads_today: 0,
          start_date: now,
          end_date: null,
        });
      }
    } else {
      // Reward: 1 Month Free Premium Tools & +35 Forms
      if (referrerSub) {
        let currentToolsDate = referrerSub.tools_active_until;
        
        // If current tools validity is in the past or null, start from today
        if (!currentToolsDate || currentToolsDate < now) {
          currentToolsDate = now;
        }

        const newToolsDate = new Date(currentToolsDate);
        newToolsDate.setDate(newToolsDate.getDate() + 30);

        await db.update(subscriptions)
          .set({ 
            download_limit: (referrerSub.download_limit || 0) + 35,
            tools_active_until: newToolsDate,
          })
          .where(eq(subscriptions.id, referrerSub.id));
      } else {
        const newToolsDate = new Date(now);
        newToolsDate.setDate(newToolsDate.getDate() + 30);

        await db.insert(subscriptions).values({
          id: crypto.randomUUID(),
          user_id: user.referred_by,
          plan_type: 'free',
          is_active: true,
          download_limit: 40, // 5 base + 35 reward
          downloads_used: 0,
          free_downloads_today: 0,
          watermark_downloads_today: 0,
          start_date: now,
          end_date: null,
          tools_active_until: newToolsDate,
        });
      }
    }
  } catch (error) {
    // Non-critical: log but don't fail the payment
    console.error("[Referral] Error processing reward:", error);
  }
}