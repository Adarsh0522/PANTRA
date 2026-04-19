import { NextResponse } from "next/server";
import { db } from "@/db";
import { payments, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PLANS, type PlanKey } from "@/lib/plans";
import crypto from "crypto";

/**
 * Frinext Webhook Handler
 *
 * CRITICAL: Do NOT trust webhook data directly.
 * Always re-verify with Frinext's check-order-status API.
 */
export async function POST(req: Request) {
  try {
    // Parse webhook payload (could be form-encoded or JSON)
    let orderId: string | null = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      orderId = formData.get("order_id") as string;
    } else {
      const body = await req.json();
      orderId = body.order_id || body.orderId;
    }

    if (!orderId) {
      console.error("[Webhook] Missing order_id");
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    console.log("WEBHOOK HIT:", orderId);

    // Find payment record
    const payment = await db.query.payments.findFirst({
      where: eq(payments.order_id, orderId),
    });

    if (!payment) {
      console.error("[Webhook] Unknown order_id:", orderId);
      return NextResponse.json({ error: "Unknown order" }, { status: 404 });
    }

    // Already processed? Skip.
    if (payment.status === "PAID") {
      return NextResponse.json({ status: "already_processed" });
    }

    // SECURITY: Re-verify with Frinext API — DO NOT TRUST webhook directly
    const verifyRes = await fetch("https://frinext.com/api/check-order-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        user_token: process.env.FRINEXT_TOKEN!,
        order_id: orderId,
      }),
    });

    const verifyData = await verifyRes.json();

    const apiStatus = verifyData?.status?.toUpperCase();

    if (apiStatus === "COMPLETED" || apiStatus === "SUCCESS") {
      await db
        .update(payments)
        .set({
          status: "PAID",
          frinext_txn_id: verifyData?.result?.txn_id || null,
        })
        .where(eq(payments.order_id, orderId));

      // Activate plan (skip for per_form)
      if (payment.plan_type !== "per_form") {
        const planKey = payment.plan_type as PlanKey;
        const plan = PLANS[planKey];

        if (plan) {
          const now = new Date();
          let endDate: Date;

          switch (planKey) {
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

          // Deactivate existing
          const existingSub = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.user_id, payment.user_id),
          });

          if (existingSub) {
            await db
              .update(subscriptions)
              .set({ is_active: false })
              .where(eq(subscriptions.id, existingSub.id));
          }

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
        }
      }

      console.log(`[Webhook] Payment ${orderId} verified and activated.`);
      return NextResponse.json({ status: "verified_and_activated" });
    }

    console.log(`[Webhook] Payment ${orderId} not yet completed:`, verifyData?.status);
    return NextResponse.json({ status: "not_completed" });
  } catch (error) {
    console.error("[Webhook] Error processing:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
