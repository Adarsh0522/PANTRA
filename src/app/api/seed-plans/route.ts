import { NextResponse } from "next/server";
import { db } from "@/db";
import { app_plans } from "@/db/schema";
import { INITIAL_PLANS } from "@/lib/plans";

export async function GET() {
    try {
        if (!INITIAL_PLANS) {
            return NextResponse.json({ error: "INITIAL_PLANS object sapadla nahi" }, { status: 400 });
        }

        // Junya plans la safe format madhe map kara (Numbers explicitly convert kele ahet)
        const plansToInsert = Object.entries(INITIAL_PLANS).map(([key, plan]: [string, any], index) => ({
            key: key,
            name: plan.name || "Unknown Plan",
            price: Number(plan.price) || 0,
            ui_price: plan.ui_price ? Number(plan.ui_price) : null,
            period: plan.period || "month",
            description: plan.description || "",
            total_limit: plan.limit === Infinity ? 999999 : (Number(plan.limit) || 0),
            monthly_limit: null,
            daily_limit: 0,
            watermark_limit: 0,
            watermark: false,
            extra_per_form: 0,
            badge: plan.badge || null,
            cta: plan.cta || "Get Started",
            features: plan.features || [], // Drizzle automatically converts arrays to JSON
            sort_order: index + 1,
        }));

        // 🔥 Fix: Explicitly added { target: app_plans.key } 
        await db.insert(app_plans).values(plansToInsert).onConflictDoNothing({ target: app_plans.key });

        return NextResponse.json({ message: "Plans seeded successfully! 🎉" });
    } catch (error: any) {
        console.error("SEEDING EXACT ERROR:", error);

        // Postgres cha internal khara error baher kadhli ahe
        const pgError = error?.cause?.message || error?.detail || error?.message || String(error);

        return NextResponse.json({
            error: "Failed to seed plans",
            details: pgError
        }, { status: 500 });
    }
}