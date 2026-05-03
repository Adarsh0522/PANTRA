import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { payments, subscriptions, users, referrals } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getPlan, type PlanKey } from "@/lib/plans";
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
        let endDate: Date;

        switch (planKey) {
          case "monthly": endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); break;
          case "quarterly": endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); break;
          case "yearly": endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); break;
          default: endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        }

        // Deactivate old plans
        await db.update(subscriptions)
          .set({ is_active: false })
          .where(eq(subscriptions.user_id, payment.user_id));

        // Insert new plan
        await db.insert(subscriptions).values({
          id: crypto.randomUUID(),
          user_id: payment.user_id,
          plan_type: planKey,
          is_active: true,
          downloads_used: 0,
          download_limit: plan.limit === Infinity ? 999999 : plan.limit,
          start_date: now,
          end_date: endDate,
        });

        // Process Referral Conversion
        const user = await db.query.users.findFirst({
          where: eq(users.id, payment.user_id)
        });

        if (user && user.referred_by && !user.is_referral_converted) {
          // Mark user as converted
          await db.update(users)
            .set({ is_referral_converted: true })
            .where(eq(users.id, user.id));

          // Increment referrer's converted count
          const referrerProfile = await db.query.referrals.findFirst({
            where: eq(referrals.user_id, user.referred_by)
          });

          if (referrerProfile) {
            await db.update(referrals)
              .set({ converted_users_count: referrerProfile.converted_users_count + 1 })
              .where(eq(referrals.id, referrerProfile.id));
          }
        }
      }
    } else {
      // Handle "per_form" payment by decrementing usage count
      // so the user effectively gets 1 extra allowed generation.
      const existingSub = await db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.user_id, payment.user_id),
          eq(subscriptions.is_active, true)
        ),
      });

      if (existingSub) {
        if (existingSub.plan_type === 'free') {
          await db.update(subscriptions)
            .set({ 
              free_downloads_today: Math.max(0, (existingSub.free_downloads_today || 0) - 1),
              downloads_used: Math.max(0, (existingSub.downloads_used || 0) - 1)
            })
            .where(eq(subscriptions.id, existingSub.id));
        } else {
          await db.update(subscriptions)
            .set({ downloads_used: Math.max(0, (existingSub.downloads_used || 0) - 1) })
            .where(eq(subscriptions.id, existingSub.id));
        }
      }
    }

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
