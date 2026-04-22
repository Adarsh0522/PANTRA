import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orderId } = (await req.json()) as { orderId: string };
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    // 🔥 API BYPASS: Fakt database check kara. Frinext API kade verify karaychi garaj nahi.
    const payment = await db.query.payments.findFirst({
      where: eq(payments.order_id, orderId),
    });

    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    if (payment.status === "PAID") {
      return NextResponse.json({
        status: "PAID",
        plan: payment.plan_type,
        message: "Payment verified via Webhook",
      });
    }

    // Webhook ajun aala naslyas pending pathva (Frontend automatically 2 sec nantar parat check karel)
    return NextResponse.json({
      status: payment.status,
      message: "Payment not yet confirmed",
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}