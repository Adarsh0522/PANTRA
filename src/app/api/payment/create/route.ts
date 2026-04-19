import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { getPlanAmount, type PlanKey } from "@/lib/plans";
import crypto from "crypto";
import { BASE_URL } from "@/lib/constants";

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

    // SECURITY: Amount is ALWAYS derived from backend config, never from frontend.
    const amount = getPlanAmount(plan);
    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid plan amount" }, { status: 400 });
    }

    // Generate orderId on server
    const orderId = "PAN-" + Date.now();
    const paymentId = crypto.randomUUID();

    // Call Frinext create-order API
    const redirectUrl = `${BASE_URL}/payment-status?order_id=${orderId}`;

    const frinextRes = await fetch("https://frinext.com/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        customer_mobile: user.mobile_number || "9999999999",
        user_token: process.env.FRINEXT_TOKEN!,
        amount: amount.toString(),
        order_id: orderId,
        redirect_url: redirectUrl,
        remark1: "PANTRA",
        remark2: plan,
      }),
    });

    const frinextData = await frinextRes.json();

    if (!frinextData?.result?.payment_url) {
      console.error("Frinext create-order failed:", frinextData);
      return NextResponse.json(
        { error: "Payment gateway error", details: frinextData },
        { status: 502 }
      );
    }

    // Save payment record as PENDING
    await db.insert(payments).values({
      id: paymentId,
      user_id: user.id,
      order_id: orderId,
      amount,
      plan_type: plan,
      status: "PENDING",
    });

    return NextResponse.json({
      payment_url: frinextData.result.payment_url,
      orderId,
    });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
