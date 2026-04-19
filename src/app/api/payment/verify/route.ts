import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { payments, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PLANS, type PlanKey } from "@/lib/plans";
import crypto from "crypto";

/**
 * Verify payment status with Frinext, then activate plan if PAID.
 */
async function verifyWithFrinext(orderId: string) {
  const res = await fetch("https://frinext.com/api/check-order-status", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      user_token: process.env.FRINEXT_TOKEN!,
      order_id: orderId,
    }),
  });

  return res.json();
}

/**
 * Activate a user's plan after successful payment.
 */
async function activateUserPlan(userId: string, planType: PlanKey) {
  const plan = PLANS[planType];
  if (!plan || planType === "free" || planType === "per_form") return;

  // Calculate end date
  const now = new Date();
  let endDate: Date;

  switch (planType) {
    case "monthly":
      endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      break;
    case "quarterly":
      endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      break;
    case "yearly":
      endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  // Deactivate any existing subscription
  const existingSub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.user_id, userId),
  });

  if (existingSub) {
    await db
      .update(subscriptions)
      .set({ is_active: false })
      .where(eq(subscriptions.id, existingSub.id));
  }

  // Create new subscription
  await db.insert(subscriptions).values({
    id: crypto.randomUUID(),
    user_id: userId,
    plan_type: planType,
    is_active: true,
    downloads_used: 0,
    download_limit: plan.limit === Infinity ? 999999 : plan.limit,
    start_date: now,
    end_date: endDate,
  });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = (await req.json()) as { orderId: string };

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // Find payment record
    const payment = await db.query.payments.findFirst({
      where: eq(payments.order_id, orderId),
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // SECURITY: Verify with Frinext — NEVER trust frontend/webhook alone
    const frinextData = await verifyWithFrinext(orderId);
    console.log("VERIFY RESULT:", frinextData);

    if (frinextData?.status === "COMPLETED") {
      // Update payment status to PAID
      await db
        .update(payments)
        .set({
          status: "PAID",
          frinext_txn_id: frinextData?.result?.txn_id || null,
        })
        .where(eq(payments.order_id, orderId));

      // Activate user plan (skip for per_form — it's a one-off)
      if (payment.plan_type !== "per_form") {
        await activateUserPlan(payment.user_id, payment.plan_type as PlanKey);
      }

      return NextResponse.json({
        status: "PAID",
        plan: payment.plan_type,
        message: "Payment verified and plan activated",
      });
    }

    // Not yet paid
    return NextResponse.json({
      status: payment.status,
      frinextStatus: frinextData?.status || "UNKNOWN",
      message: "Payment not yet confirmed",
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
