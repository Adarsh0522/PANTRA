import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { getPlanAmount, type PlanKey } from "@/lib/plans";
import Razorpay from "razorpay";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = (await req.json()) as { plan: PlanKey };

    // Validate plan
    const validPlans: PlanKey[] = ["per_form", "monthly", "quarterly", "yearly"];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Amount is derived from backend config
    const amount = await getPlanAmount(plan);
    const amountInPaise = amount * 100; // Razorpay expects paise

    // Minimum amount validation
    if (amountInPaise < 100) {
      return NextResponse.json({ error: "Invalid plan amount (Minimum 1 INR)" }, { status: 400 });
    }

    // Generate internal order info
    const internalOrderId = "PAN-" + Date.now();
    const paymentId = crypto.randomUUID();

    // Create Razorpay Order
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: internalOrderId,
    };

    const order = await razorpay.orders.create(options);

    if (!order || !order.id) {
      throw new Error("Failed to create Razorpay order");
    }

    // Save payment record as PENDING
    await db.insert(payments).values({
      id: paymentId,
      user_id: user.id,
      order_id: order.id, // we use Razorpay's order ID for easier tracking
      amount,
      plan_type: plan,
      status: "PENDING",
    });

    return NextResponse.json({
      order_id: order.id,
      amount: amountInPaise,
      currency: order.currency,
      internalOrderId,
    });
  } catch (error) {
    console.error("Razorpay create order error:", error);
    // Returning 500 triggers the Frinext fallback on the frontend
    return NextResponse.json(
      { error: "Payment gateway error", details: error },
      { status: 500 }
    );
  }
}
