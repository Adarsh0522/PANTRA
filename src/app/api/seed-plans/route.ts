import { NextResponse } from "next/server";
import { db } from "@/db";
import { app_plans } from "@/db/schema";
import { INITIAL_PLANS, PLAN_ORDER } from "@/lib/plans";

export async function GET() {
    try {
        if (!INITIAL_PLANS) {
            return NextResponse.json({ error: "INITIAL_PLANS object sapadla nahi" }, { status: 400 });
        }

        // Map new simplified plans to DB format
        const plansToInsert = PLAN_ORDER.map((key, index) => {
            const plan = INITIAL_PLANS[key];
            return {
                key: key,
                name: plan.name,
                price: plan.price,
                ui_price: null,
                period: "lifetime",
                description: plan.description,
                total_limit: plan.downloadLimit,
                monthly_limit: null,
                daily_limit: 0,
                watermark_limit: 0,
                watermark: false,
                extra_per_form: plan.extraPerForm,
                badge: plan.badge || null,
                cta: plan.cta,
                features: plan.features,
                sort_order: index + 1,
            };
        });

        await db.insert(app_plans).values(plansToInsert).onConflictDoNothing({ target: app_plans.key });

        return NextResponse.json({ message: "Plans seeded successfully! 🎉" });
    } catch (error: any) {
        console.error("SEEDING EXACT ERROR:", error);

        const pgError = error?.cause?.message || error?.detail || error?.message || String(error);

        return NextResponse.json({
            error: "Failed to seed plans",
            details: pgError
        }, { status: 500 });
    }
}